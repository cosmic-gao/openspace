import type { Route } from './route.ts';

/**
 * 路由匹配结果
 *
 * @example
 * ```typescript
 * const match: RouteMatch = {
 *   route: { segments: [...], pattern: '/blog/:id' },
 *   params: { id: '123' },
 * };
 * ```
 */
export interface RouteMatch {
    /** 匹配的路由 */
    readonly route: Route;

    /** 提取的路径参数 */
    readonly params: Readonly<Record<string, string | string[]>>;
}
