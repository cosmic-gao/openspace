import type { Segment } from './segment';

/**
 * 路由接口
 *
 * 表示完整的路由定义，由多个段组成。
 *
 * @example
 * ```typescript
 * const route: Route = {
 *   segments: [
 *     { raw: 'blog', type: 'static' },
 *     { raw: '[slug]', type: 'dynamic', name: 'slug' },
 *   ],
 *   pattern: '/blog/:slug',
 * };
 * ```
 */
export interface Route {
    /** 路由段列表 */
    readonly segments: ReadonlyArray<Segment>;

    /** 生成的 URL 模式 */
    readonly pattern: string;
}
