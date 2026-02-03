import { readdir, stat } from 'node:fs/promises';
import { join, parse as parsePath } from 'node:path';
import {
    type FileConvention,
    type RouteFile,
    type RouteNode,
    type RouteTree,
    defineConvention,
} from '../types';
import { type SegmentParser, createParser } from '../core';

/**
 * 默认文件约定（使用全部预设）
 */
const DEFAULT_CONVENTION: FileConvention<RouteFile> = defineConvention();

/**
 * 扫描选项
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 */
export interface ScanOptions<T extends string = RouteFile> {
    /** 文件约定，默认使用 defineConvention() */
    convention?: FileConvention<T>;
    /** 段解析器，默认使用 createParser() */
    parser?: SegmentParser;
    /**
     * 忽略的目录/文件模式（支持简单匹配）
     * @example ['node_modules', '.*', '__tests__']
     */
    ignore?: string[];
    /**
     * 最大并发扫描数
     * @default Infinity
     */
    concurrency?: number;
    /**
     * 启用缓存（预留，暂未实现）
     * @experimental
     */
    cache?: boolean;
}

/**
 * 路由扫描器接口
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 */
export interface RouteScanner<T extends string = RouteFile> {
    /**
     * 扫描目录生成路由树
     *
     * @param dir - 根目录路径
     * @returns 路由树
     */
    scan(dir: string): Promise<RouteTree<T>>;
}

/**
 * 创建路由扫描器
 *
 * @typeParam T - 自定义文件类型
 * @param options - 扫描选项
 *
 * @example
 * ```typescript
 * // 默认用法
 * const scanner = createScanner();
 * const tree = await scanner.scan('./app');
 *
 * // 自定义文件类型
 * type CustomFile = RouteFile | 'meta';
 * const customScanner = createScanner<CustomFile>({
 *   convention: {
 *     files: ['page', 'layout', 'meta'],
 *     extensions: ['.tsx', '.ts'],
 *   },
 * });
 * ```
 */
export function createScanner<T extends string = RouteFile>(
    options: ScanOptions<T> = {}
): RouteScanner<T> {
    const convention = (options.convention ?? DEFAULT_CONVENTION) as FileConvention<T>;
    const parser = options.parser ?? createParser();
    const excludes = options.ignore ?? [];
    const limit = options.concurrency ?? Infinity;

    /**
     * 检查条目名称是否匹配排除模式
     */
    const excluded = (name: string): boolean => {
        for (const pattern of excludes) {
            // 支持简单通配符匹配
            if (pattern.startsWith('*')) {
                // *xx -> 后缀匹配
                if (name.endsWith(pattern.slice(1))) return true;
            } else if (pattern.endsWith('*')) {
                // xx* -> 前缀匹配
                if (name.startsWith(pattern.slice(0, -1))) return true;
            } else if (pattern === name) {
                // 精确匹配
                return true;
            } else if (pattern.startsWith('.') && name.startsWith('.')) {
                // .* 匹配所有隐藏文件/目录
                if (pattern === '.*') return true;
            }
        }
        return false;
    };

    /**
     * 限流执行异步任务
     */
    const throttle = async <R>(
        factories: (() => Promise<R>)[],
        cap: number
    ): Promise<R[]> => {
        if (cap === Infinity) {
            return Promise.all(factories.map(fn => fn()));
        }

        const results: R[] = [];
        const pending: Promise<void>[] = [];

        for (const fn of factories) {
            const promise = fn().then(r => { results.push(r); });
            pending.push(promise);

            if (pending.length >= cap) {
                await Promise.race(pending);
                for (let i = pending.length - 1; i >= 0; i--) {
                    if (await Promise.race([pending[i], Promise.resolve('wait')]) !== 'wait') {
                        pending.splice(i, 1);
                    }
                }
            }
        }

        await Promise.all(pending);
        return results;
    };

    const scanNode = async (dir: string, segmentRaw: string): Promise<RouteNode<T>> => {
        const entries = await readdir(dir, { withFileTypes: true });

        const components: Partial<Record<T, string>> = {};
        const children: RouteNode<T>[] = [];
        const slots: Record<string, RouteNode<T>> = {};
        const intercepts: RouteNode<T>[] = [];
        let middlewarePath: string | undefined;

        const dirTasks: { entryName: string; fullPath: string }[] = [];

        for (const entry of entries) {
            // 检查是否应排除
            if (excluded(entry.name)) {
                continue;
            }

            const fullPath = join(dir, entry.name);

            if (entry.isFile()) {
                const { name, ext } = parsePath(entry.name);

                // 检查扩展名是否支持
                if (!convention.extensions.includes(ext)) {
                    continue;
                }

                // 检查文件名是否为路由文件
                if ((convention.files as readonly string[]).includes(name)) {
                    components[name as T] = fullPath;

                    // 单独提取 middleware 路径
                    if (name === 'middleware') {
                        middlewarePath = fullPath;
                    }
                }
            } else if (entry.isDirectory()) {
                // 收集子目录扫描任务
                dirTasks.push({
                    entryName: entry.name,
                    fullPath,
                });
            }
        }

        // 限流执行子目录扫描
        const scanned = await throttle(
            dirTasks.map(({ entryName, fullPath }) => async () => {
                const segment = parser.parse(entryName);
                const node = await scanNode(fullPath, entryName);
                return { segment, node };
            }),
            limit
        );

        // 根据段类型分类
        for (const { segment, node } of scanned) {
            switch (segment.type) {
                case 'parallel':
                    // 并行路由：@slot -> slots
                    if (segment.name) {
                        slots[segment.name] = node;
                    }
                    break;

                case 'interceptSame':
                case 'interceptParent':
                case 'interceptRoot':
                    // 拦截路由 -> intercepts
                    intercepts.push(node);
                    break;

                default:
                    // 其他（静态、动态、分组等） -> children
                    children.push(node);
                    break;
            }
        }

        // 构建当前节点的 segment 对象
        // 如果是根递归调用，segmentRaw 可能是空或者 root dirname
        const segment = parser.parse(segmentRaw);

        return {
            segment,
            components,
            children,
            ...(Object.keys(slots).length > 0 ? { slots } : {}),
            ...(intercepts.length > 0 ? { intercepts } : {}),
            ...(middlewarePath ? { middleware: middlewarePath } : {}),
        };
    }

    return {
        async scan(dir: string): Promise<RouteTree<T>> {
            try {
                // 确保根目录存在
                const stats = await stat(dir);
                if (!stats.isDirectory()) {
                    throw new Error(`Path is not a directory: ${dir}`);
                }

                // 扫描根节点
                // 根节点的 segment raw 通常为空，或者由调用者决定
                // 这里我们传递空字符串作为 raw，这样 parser 会将其解析为静态空段
                const root = await scanNode(dir, '');

                return { root };
            } catch (error) {
                // 重新抛出错误，附带更好的上下文
                throw new Error(`Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
    };
}
