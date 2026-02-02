import type { Segment } from './segment';

/**
 * 路由文件类型
 *
 * 文件系统路由支持的特殊文件约定。
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
 * @example
 * ```typescript
 * const node: RouteNode = {
 *   segment: { raw: '[slug]', type: 'dynamic', name: 'slug' },
 *   components: { page: '/path/to/page.tsx' },
 *   children: [],
 * };
 * ```
 */
export interface RouteNode {
    /** 当前节点的段定义 */
    readonly segment: Segment;

    /** 节点包含的路由文件路径映射 */
    readonly components: Readonly<Partial<Record<RouteFile, string>>>;

    /** 子节点列表 */
    readonly children: ReadonlyArray<RouteNode>;

    /** 并行路由插槽 */
    readonly slots?: Readonly<Record<string, RouteNode>>;

    /** 拦截路由 */
    readonly intercepts?: ReadonlyArray<RouteNode>;
}

/**
 * 路由树接口
 *
 * 表示完整的文件系统路由结构。
 *
 * @example
 * ```typescript
 * const tree: RouteTree = {
 *   root: {
 *     segment: { raw: '', type: 'static' },
 *     files: ['layout'],
 *     children: [
 *       {
 *         segment: { raw: 'blog', type: 'static' },
 *         files: ['page'],
 *         children: [],
 *       },
 *     ],
 *   },
 * };
 * ```
 */
export interface RouteTree {
    /** 根节点 */
    readonly root: RouteNode;
}
