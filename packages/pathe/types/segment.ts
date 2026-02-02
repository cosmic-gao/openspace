/**
 * 路由段类型
 *
 * - `static`: 静态路径段，如 `blog` → `/blog`
 * - `dynamic`: 动态段，如 `[slug]` → `/blog/:slug`
 * - `catchAll`: 捕获所有段，如 `[...slug]` → `/shop/:slug+`
 * - `optionalCatchAll`: 可选捕获，如 `[[...slug]]` → `/shop/:slug*`
 * - `group`: 路由分组，如 `(marketing)` → 不影响 URL
 * - `parallel`: 并行路由插槽，如 `@modal` → 同一布局中并行渲染
 */
export type SegmentType =
    | 'static'
    | 'dynamic'
    | 'catchAll'
    | 'optionalCatchAll'
    | 'group'
    | 'parallel';

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
 * // 捕获所有段
 * const catchAllSegment: Segment = {
 *   raw: '[...slug]',
 *   type: 'catchAll',
 *   name: 'slug',
 * };
 *
 * // 路由分组
 * const groupSegment: Segment = {
 *   raw: '(marketing)',
 *   type: 'group',
 *   name: 'marketing',
 * };
 *
 * // 并行路由
 * const parallelSegment: Segment = {
 *   raw: '@modal',
 *   type: 'parallel',
 *   name: 'modal',
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
}
