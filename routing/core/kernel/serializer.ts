import type { RouteNode, RouteTree } from '../types/index.ts';

/**
 * 序列化路由树为 JSON 字符串
 *
 * @param tree - 路由树
 * @returns JSON 字符串
 *
 * @example
 * ```typescript
 * const json = serialize(tree);
 * // 存储到文件或缓存
 * ```
 */
export function serialize(tree: RouteTree): string {
    return JSON.stringify(tree, null, 2);
}

/**
 * 从 JSON 字符串反序列化路由树
 *
 * @param json - JSON 字符串
 * @returns 路由树
 * @throws 解析失败时抛出错误
 *
 * @example
 * ```typescript
 * const tree = deserialize(json);
 * ```
 */
export function deserialize(json: string): RouteTree {
    const parsed = JSON.parse(json) as unknown;

    if (!isRouteTree(parsed)) {
        throw new Error('Invalid RouteTree structure');
    }

    return parsed;
}

/**
 * 类型守卫：检查对象是否为有效的 RouteTree
 */
function isRouteTree(obj: unknown): obj is RouteTree {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const tree = obj as Record<string, unknown>;
    return 'root' in tree && isRouteNode(tree['root']);
}

/**
 * 类型守卫：检查对象是否为有效的 RouteNode
 */
function isRouteNode(obj: unknown): obj is RouteNode {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const node = obj as Record<string, unknown>;
    return (
        'segment' in node &&
        'components' in node &&
        'children' in node &&
        Array.isArray(node['children'])
    );
}
