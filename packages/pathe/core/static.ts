import type { RouteTree, RouteNode } from '../types/tree';
import type { Route } from '../types/route';
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

        // 检查当前节点是否有 page 组件
        const hasPage = 'page' in node.components;

        // 检查是否包含动态段
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
 * 生成静态路径
 *
 * 根据路由模式和参数生成具体路径。
 *
 * @param pattern - 路由模式，如 `/blog/:slug`
 * @param params - 参数值
 * @returns 生成的路径
 *
 * @example
 * ```typescript
 * const path = generatePath('/blog/:slug', { slug: 'hello' });
 * // path === '/blog/hello'
 *
 * const catchAllPath = generatePath('/shop/:path+', { path: ['a', 'b'] });
 * // catchAllPath === '/shop/a/b'
 * ```
 */
export function generatePath(
    pattern: string,
    params: Readonly<Record<string, string | string[]>>
): string {
    let result = pattern;

    for (const [name, value] of Object.entries(params)) {
        const stringValue = Array.isArray(value) ? value.join('/') : value;

        // 替换可选捕获：:name*
        result = result.replace(`:${name}*`, stringValue);

        // 替换捕获所有：:name+
        result = result.replace(`:${name}+`, stringValue);

        // 替换动态段：:name
        result = result.replace(`:${name}`, stringValue);
    }

    return result;
}
