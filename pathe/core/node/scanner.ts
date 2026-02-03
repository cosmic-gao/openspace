import { readdir, stat } from 'node:fs/promises';
import { join, parse as parsePath } from 'node:path';
import {
    type FileConvention,
    type RouteFile,
    type RouteNode,
    type RouteTree,
    defineConvention,
} from '../types';
import { type SegmentParser, createParser } from '../lib/parser';
import { createError, PatheErrorCode, PatheError } from '../lib/errors';

/**
 * 默认文件约定（使用全部预设）
 */
const DEFAULT_CONVENTION: FileConvention<RouteFile> = defineConvention();

/**
 * 扫描选项
 */
export interface ScanOptions<T extends string = RouteFile> {
    convention?: FileConvention<T>;
    parser?: SegmentParser;
    ignore?: string[];
    concurrency?: number;
    cache?: boolean;
}

/**
 * 路由扫描器接口
 */
export interface RouteScanner<T extends string = RouteFile> {
    scan(dir: string): Promise<RouteTree<T>>;
}

/**
 * 创建路由扫描器
 */
export function createScanner<T extends string = RouteFile>(
    options: ScanOptions<T> = {}
): RouteScanner<T> {
    const convention = (options.convention ?? DEFAULT_CONVENTION) as FileConvention<T>;
    const parser = options.parser ?? createParser();
    const excludes = options.ignore ?? [];
    const limit = options.concurrency ?? Infinity;

    /**
     * 检查条目应被忽略
     */
    const isExcluded = (name: string): boolean => {
        for (const pattern of excludes) {
            if (pattern.startsWith('*')) {
                if (name.endsWith(pattern.slice(1))) return true;
            } else if (pattern.endsWith('*')) {
                if (name.startsWith(pattern.slice(0, -1))) return true;
            } else if (pattern === name) {
                return true;
            } else if (pattern.startsWith('.') && name.startsWith('.')) {
                if (pattern === '.*') return true;
            }
        }
        return false;
    };

    /**
     * 限流执行器
     */
    const throttle = async <R>(factories: (() => Promise<R>)[], cap: number): Promise<R[]> => {
        if (cap === Infinity) return Promise.all(factories.map(f => f()));

        const results: R[] = [];
        const executing: Promise<void>[] = [];

        for (const factory of factories) {
            const p = factory().then(r => { results.push(r); });
            executing.push(p);

            if (executing.length >= cap) {
                await Promise.race(executing);
                // 移除已完成的任务
                // 注意：这里简单实现，实际上 Promise.race 不会改变数组，
                // 需要额外的清理逻辑或使用基于 Iterator 的池。
                // 鉴于这是一个重构，保留原有逻辑的简化版，或稍微改进。
                // 原有逻辑稍微有点复杂。这里使用一个更标准的方式。
                const index = await Promise.race(executing.map((p, i) => p.then(() => i)));
                executing.splice(index, 1);
            }
        }
        await Promise.all(executing);
        return results;
    };

    /**
     * 读取并分类目录项
     */
    const readDirectory = async (dir: string) => {
        const entries = await readdir(dir, { withFileTypes: true });
        const files: { name: string; path: string }[] = [];
        const subdirs: { name: string; path: string }[] = [];

        for (const entry of entries) {
            if (isExcluded(entry.name)) continue;

            const fullPath = join(dir, entry.name);
            if (entry.isFile()) {
                files.push({ name: entry.name, path: fullPath });
            } else if (entry.isDirectory()) {
                subdirs.push({ name: entry.name, path: fullPath });
            }
        }
        return { files, subdirs };
    };

    /**
     * 解析文件组件
     */
    const resolveComponents = (files: { name: string; path: string }[]) => {
        const components: Partial<Record<T, string>> = {};
        let middleware: string | undefined;

        for (const file of files) {
            const { name, ext } = parsePath(file.name);
            if (!convention.extensions.includes(ext)) continue;

            if ((convention.files as readonly string[]).includes(name)) {
                components[name as T] = file.path;
                if (name === 'middleware') middleware = file.path;
            }
        }
        return { components, middleware };
    };

    /**
     * 递归扫描节点
     */
    const scanNode = async (dir: string, segmentRaw: string): Promise<RouteNode<T>> => {
        const { files, subdirs } = await readDirectory(dir);
        const { components, middleware } = resolveComponents(files);

        // 递归扫描子目录
        const childrenNodes = await throttle(
            subdirs.map(sub => async () => scanNode(sub.path, sub.name)),
            limit
        );

        // 分类子节点
        const children: RouteNode<T>[] = [];
        const slots: Record<string, RouteNode<T>> = {};
        const intercepts: RouteNode<T>[] = [];

        for (const childNode of childrenNodes) {
            const type = childNode.segment.type;

            if (type === 'parallel' && childNode.segment.name) {
                slots[childNode.segment.name] = childNode;
            } else if (type === 'interceptSame' || type === 'interceptParent' || type === 'interceptRoot') {
                intercepts.push(childNode);
            } else {
                children.push(childNode);
            }
        }

        return {
            segment: parser.parse(segmentRaw),
            components,
            children,
            ...(Object.keys(slots).length ? { slots } : {}),
            ...(intercepts.length ? { intercepts } : {}),
            ...(middleware ? { middleware } : {}),
        };
    };

    return {
        async scan(dir: string): Promise<RouteTree<T>> {
            try {
                const stats = await stat(dir);
                if (!stats.isDirectory()) {
                    throw createError(PatheErrorCode.SCAN_FAILED, `Path is not a directory: ${dir}`);
                }

                const root = await scanNode(dir, '');
                return { root };
            } catch (error) {
                if (error instanceof PatheError) throw error;
                throw createError(
                    PatheErrorCode.SCAN_FAILED,
                    `Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`,
                    error
                );
            }
        },
    };
}
