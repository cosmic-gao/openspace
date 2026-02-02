import { readdir, stat } from 'node:fs/promises';
import { join, parse as parsePath } from 'node:path';
import type { RouteTree, RouteNode, RouteFile } from '../types/tree';
import type { FileConvention } from '../types/convention';
import type { SegmentParser } from '../core/parser';
import { createParser } from '../core/parser';

/**
 * 默认文件约定
 */
const DEFAULT_CONVENTION: FileConvention<RouteFile> = {
    files: [
        'page',
        'layout',
        'template',
        'loading',
        'error',
        'not-found',
        'default',
        'route',
    ],
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
};

/**
 * 扫描选项
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 */
export interface ScanOptions<T extends string = RouteFile> {
    /** 文件约定，默认使用 Next.js 风格 */
    convention?: FileConvention<T>;
    /** 段解析器，默认使用 createParser() */
    parser?: SegmentParser;
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

    async function scanNode(dir: string, segmentRaw: string): Promise<RouteNode<T>> {
        const entries = await readdir(dir, { withFileTypes: true });

        const components: Partial<Record<T, string>> = {};
        const children: RouteNode<T>[] = [];
        const slots: Record<string, RouteNode<T>> = {};
        const intercepts: RouteNode<T>[] = [];

        for (const entry of entries) {
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
                }
            } else if (entry.isDirectory()) {
                const segment = parser.parse(entry.name);
                const node = await scanNode(fullPath, entry.name);

                // 根据段类型分类
                switch (segment.type) {
                    case 'parallel':
                        // 并行路由：@slot -> slots
                        // name 是 slot 名称 (去掉 @)
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
                // 根节点的 segment raw 通常为空，或者由调用者决定，这里我们设为空字符串表示根
                // 或者我们可以使用目录名。Next.js 中 app 目录本身通常不作为段的一部分（它是根）。
                // 这里我们传递空字符串作为 raw，这样 parser 会将其解析为静态空段。
                const root = await scanNode(dir, '');

                return { root };
            } catch (error) {
                // 重新抛出错误，附带更好的上下文
                throw new Error(`Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
    };
}
