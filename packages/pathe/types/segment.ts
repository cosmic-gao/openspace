/**
 * 路由段类型
 *
 * - `static`: 静态路径段，如 `blog` → `/blog`
 * - `dynamic`: 动态段，如 `[slug]` → `/blog/:slug`
 * - `catchAll`: 捕获所有段，如 `[...slug]` → `/shop/:slug+`
 * - `optionalCatchAll`: 可选捕获，如 `[[...slug]]` → `/shop/:slug*`
 * - `group`: 路由分组，如 `(marketing)` → 不影响 URL
 * - `parallel`: 并行路由插槽，如 `@modal` → 同一布局中并行渲染
 * - `interceptSame`: 同级拦截，如 `(.)photo` → 拦截同级路由
 * - `interceptParent`: 父级拦截，如 `(..)photo` → 拦截上一级路由
 * - `interceptRoot`: 根级拦截，如 `(...)photo` → 拦截根路由
 */
export type SegmentType =
    | 'static'
    | 'dynamic'
    | 'catchAll'
    | 'optionalCatchAll'
    | 'group'
    | 'parallel'
    | 'interceptSame'
    | 'interceptParent'
    | 'interceptRoot';

/**
 * 路由段接口
 *
 * 表示路由路径中的单个段。
 *
 * @example
 * ```typescript
 * // 静态段
 * const staticSegment: Segment = {
 *   raw: 'blog',
 *   type: 'static',
 * };
 *
 * // 动态段
 * const dynamicSegment: Segment = {
 *   raw: '[slug]',
 *   type: 'dynamic',
 *   name: 'slug',
 * };
 *
 * // 拦截路由
 * const interceptSegment: Segment = {
 *   raw: '(..)photo',
 *   type: 'interceptParent',
 *   name: 'photo',
 * };
 * ```
 */
export interface Segment {
    /** 原始名称（文件系统中的目录名） */
    readonly raw: string;

    /** 段类型 */
    readonly type: SegmentType;

    /** 提取的参数名或分组名 */
    readonly name?: string;

    /** 拦截层级（拦截路由专用） */
    readonly level?: number;
}
