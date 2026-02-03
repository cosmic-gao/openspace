import type { Route, RouteNode, RouteTree } from '../types';
import { createBuilder } from './builder';

/**
 * 静态参数接口
 *
 * 表示一个路由可能生成的静态参数组合。
 *
 * @example
 * ```typescript
 * const staticParams: StaticParams = {
 *   route: { segments: [...], pattern: '/blog/:slug' },
 *   params: [
 *     { slug: 'hello-world' },
 *     { slug: 'getting-started' },
 *   ],
 * };
 * ```
 */
export interface StaticParams {
    /** 路由定义 */
    readonly route: Route;
    /** 参数组合列表 */
    readonly params: ReadonlyArray<Readonly<Record<string, string | string[]>>>;
}

/**
 * 动态路由信息
 */
export interface DynamicRoute {
    /** 路由模式 */
    readonly pattern: string;
    /** 参数名列表 */
    readonly paramNames: readonly string[];
    /** 组件路径（page 文件） */
    readonly component?: string;
}

/**
 * 静态参数收集器接口
 */
export interface StaticCollector {
    /**
     * 收集路由树中所有动态路由
     *
     * @param tree - 路由树
     * @returns 动态路由列表
     */
    collect(tree: RouteTree): DynamicRoute[];
}

/**
 * 创建静态参数收集器
 *
 * @example
 * ```typescript
 * const collector = createCollector();
 * const dynamicRoutes = collector.collect(tree);
 *
 * // dynamicRoutes 包含所有需要生成静态参数的路由
 * for (const route of dynamicRoutes) {
 *   console.log(route.pattern, route.paramNames);
 * }
 * ```
 */
export function createCollector(): StaticCollector {
    const builder = createBuilder();

    /**
     * 递归收集动态路由
     */
    const collectNode = <T extends string>(
        node: RouteNode<T>,
        parentSegments: RouteNode<T>['segment'][] = []
    ): DynamicRoute[] => {
        const results: DynamicRoute[] = [];
        const currentSegments = [...parentSegments, node.segment];

        const hasPage = 'page' in node.components;

        const dynamicSegments = currentSegments.filter(
            s => s.type === 'dynamic' || s.type === 'catchAll' || s.type === 'optionalCatchAll'
        );

        if (hasPage && dynamicSegments.length > 0) {
            const route = builder.build(currentSegments);
            const paramNames = dynamicSegments
                .map(s => s.name)
                .filter((name): name is string => name !== undefined);

            results.push({
                pattern: route.pattern,
                paramNames,
                component: node.components['page' as T],
            });
        }

        // 递归处理子节点
        for (const child of node.children) {
            results.push(...collectNode(child, currentSegments));
        }

        // 递归处理插槽
        if (node.slots) {
            for (const slotNode of Object.values(node.slots)) {
                results.push(...collectNode(slotNode, currentSegments));
            }
        }

        return results;
    }

    return {
        collect(tree: RouteTree): DynamicRoute[] {
            return collectNode(tree.root);
        },
    };
}

/**
 * generatePath 选项
 */
export interface GeneratePathOptions {
    /**
     * 缺参或空数组时是否抛出错误
     * @default true
     */
    throwOnMissing?: boolean;
}

/**
 * 生成静态路径
 *
 * 根据路由模式和参数生成具体路径。
 *
 * @param pattern - 路由模式，如 `/blog/:slug`
 * @param params - 参数值
 * @param options - 生成选项
 * @returns 生成的路径
 * @throws 当缺少必要参数或 catch-all 为空数组时抛出错误（除非 throwOnMissing: false）
 *
 * @example
 * ```typescript
 * const path = generatePath('/blog/:slug', { slug: 'hello' });
 * // path === '/blog/hello'
 *
 * const catchAllPath = generatePath('/shop/:path+', { path: ['a', 'b'] });
 * // catchAllPath === '/shop/a/b'
 *
 * // 缺参时抛错
 * generatePath('/blog/:slug', {}); // throws Error
 *
 * // 降级模式：返回未替换的模式
 * generatePath('/blog/:slug', {}, { throwOnMissing: false });
 * // returns '/blog/:slug'
 * ```
 */
export function generatePath(
    pattern: string,
    params: Readonly<Record<string, string | string[]>>,
    options: GeneratePathOptions = {}
): string {
    const { throwOnMissing = true } = options;
    let result = pattern;

    for (const [name, value] of Object.entries(params)) {
        // 检查空数组
        if (Array.isArray(value) && value.length === 0) {
            if (throwOnMissing) {
                throw new Error(`Empty array for catch-all parameter: ${name}`);
            }
            continue;
        }

        const stringValue = Array.isArray(value) ? value.join('/') : value;

        // 替换可选捕获：:name*
        result = result.replace(`:${name}*`, stringValue);

        // 替换捕获所有：:name+
        result = result.replace(`:${name}+`, stringValue);

        // 替换动态段：:name
        result = result.replace(`:${name}`, stringValue);
    }

    // 检查未替换的参数
    const missingParams = result.match(/:\w+[*+]?/g);
    if (missingParams && missingParams.length > 0) {
        if (throwOnMissing) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }
    }

    return result;
}

