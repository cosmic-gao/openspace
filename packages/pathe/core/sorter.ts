import type { RouteNode } from '../types/tree';
import type { SegmentType } from '../types/segment';

/**
 * 段类型优先级映射
 *
 * 数值越小优先级越高：
 * - static: 0（最高优先级）
 * - dynamic: 1
 * - catchAll: 2
 * - optionalCatchAll: 3（最低优先级）
 * - 其他类型（group/parallel/intercept）不参与 URL 匹配，优先级为 0
 */
const SEGMENT_PRIORITY: Record<SegmentType, number> = {
    static: 0,
    dynamic: 1,
    catchAll: 2,
    optionalCatchAll: 3,
    group: 0,
    parallel: 0,
    interceptSame: 0,
    interceptParent: 0,
    interceptRoot: 0,
};

/**
 * 路由排序器接口
 */
export interface RouteSorter {
    /**
     * 对路由节点列表按优先级排序
     *
     * 排序规则：静态 > 动态 > catch-all > optional catch-all
     *
     * @param nodes - 路由节点列表
     * @returns 排序后的节点列表（不修改原数组）
     */
    sort<T extends string>(nodes: ReadonlyArray<RouteNode<T>>): RouteNode<T>[];

    /**
     * 递归排序整个路由树
     *
     * @param node - 根节点
     * @returns 排序后的树（不修改原树）
     */
    arrange<T extends string>(node: RouteNode<T>): RouteNode<T>;
}

/**
 * 创建路由排序器
 *
 * @example
 * ```typescript
 * const sorter = createSorter();
 *
 * // 排序子节点
 * const sorted = sorter.sort(node.children);
 *
 * // 递归排序整棵树
 * const sortedTree = sorter.arrange(root);
 * ```
 */
export function createSorter(): RouteSorter {
    /**
     * 获取节点排序优先级
     */
    function getPriority<T extends string>(node: RouteNode<T>): number {
        return SEGMENT_PRIORITY[node.segment.type];
    }

    /**
     * 比较两个节点的优先级
     *
     * @returns 负数表示 a 优先，正数表示 b 优先，0 表示相等
     */
    function compare<T extends string>(a: RouteNode<T>, b: RouteNode<T>): number {
        const priorityDiff = getPriority(a) - getPriority(b);

        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        // 优先级相同时，按字母顺序排序
        return a.segment.raw.localeCompare(b.segment.raw);
    }

    return {
        sort<T extends string>(nodes: ReadonlyArray<RouteNode<T>>): RouteNode<T>[] {
            return [...nodes].sort(compare);
        },

        arrange<T extends string>(node: RouteNode<T>): RouteNode<T> {
            // 递归排序子节点
            const sortedChildren = this.sort(node.children).map(child =>
                this.arrange(child)
            );

            // 递归排序插槽
            const sortedSlots = node.slots
                ? Object.fromEntries(
                    Object.entries(node.slots).map(([name, slotNode]) => [
                        name,
                        this.arrange(slotNode),
                    ])
                )
                : undefined;

            // 递归排序拦截路由
            const sortedIntercepts = node.intercepts
                ? node.intercepts.map(interceptNode => this.arrange(interceptNode))
                : undefined;

            return {
                ...node,
                children: sortedChildren,
                ...(sortedSlots ? { slots: sortedSlots } : {}),
                ...(sortedIntercepts ? { intercepts: sortedIntercepts } : {}),
            };
        },
    };
}
