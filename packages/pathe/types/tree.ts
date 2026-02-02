import type { Segment } from './segment';

/**
 * 路由文件类型
 *
 * 文件系统路由支持的特殊文件约定。
 * 可通过泛型扩展自定义文件类型。
 */
export type RouteFile =
    | 'page'       // 页面入口
    | 'layout'     // 布局（嵌套共享）
    | 'template'   // 模板（每次导航重新挂载）
    | 'loading'    // 加载状态
    | 'error'      // 错误边界
    | 'not-found'  // 404 页面
    | 'default'    // 并行路由默认状态
    | 'route';     // API 端点

/**
 * 路由节点接口
 *
 * 表示路由树中的单个节点，对应文件系统中的一个目录。
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 *
 * @example
 * ```typescript
 * // 使用默认类型
 * const node: RouteNode = {
 *   segment: { raw: '[slug]', type: 'dynamic', name: 'slug' },
 *   components: { page: '/path/to/page.tsx' },
 *   children: [],
 * };
 *
 * // 使用扩展类型
 * type CustomFile = RouteFile | 'meta';
 * const customNode: RouteNode<CustomFile> = {
 *   segment: { raw: 'about', type: 'static' },
 *   components: { page: '/about/page.tsx', meta: '/about/meta.ts' },
 *   children: [],
 * };
 * ```
 */
export interface RouteNode<T extends string = RouteFile> {
    /** 当前节点的段定义 */
    readonly segment: Segment;

    /** 节点包含的路由文件路径映射 */
    readonly components: Readonly<Partial<Record<T, string>>>;

    /** 子节点列表 */
    readonly children: ReadonlyArray<RouteNode<T>>;

    /** 并行路由插槽 */
    readonly slots?: Readonly<Record<string, RouteNode<T>>>;

    /** 拦截路由 */
    readonly intercepts?: ReadonlyArray<RouteNode<T>>;
}

/**
 * 路由树接口
 *
 * 表示完整的文件系统路由结构。
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 *
 * @example
 * ```typescript
 * const tree: RouteTree = {
 *   root: {
 *     segment: { raw: '', type: 'static' },
 *     components: { layout: '/layout.tsx' },
 *     children: [
 *       {
 *         segment: { raw: 'blog', type: 'static' },
 *         components: { page: '/blog/page.tsx' },
 *         children: [],
 *       },
 *     ],
 *   },
 * };
 * ```
 */
export interface RouteTree<T extends string = RouteFile> {
    /** 根节点 */
    readonly root: RouteNode<T>;
}
