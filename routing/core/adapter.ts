import type { RouteNode, RouteTree, Segment } from './types/index.ts';

/**
 * 适配上下文
 */
export interface Context<T extends string = string> {
    /** 当前节点 */
    readonly node: RouteNode<T>;
    /** 路径段链 */
    readonly segments: readonly Segment[];
    /** URL 模式 */
    readonly pattern: string;
    /** 布局路径列表 */
    readonly layouts: readonly string[];
    /** 中间件路径列表 */
    readonly middlewares: readonly string[];
}

/**
 * 组件解析器
 */
export type Resolver<R, T extends string = string> = (
    path: string,
    type: 'page' | 'layout',
    ctx: Context<T>
) => R;

/**
 * 元数据映射器
 */
export type Mapper<R, T extends string = string> = (ctx: Context<T>) => R;

/**
 * 适配器定义
 */
export interface Adapter<TRoute, TOptions> {
    /** 格式化段 */
    format: (segment: Segment) => string;

    /** 解析节点 */
    resolve: (
        node: RouteNode,
        options: TOptions,
        ctx: Context
    ) => {
        layout?: unknown;
        page?: unknown;
        meta?: unknown;
    };

    /** 创建路由 */
    create: (params: {
        path: string;
        index?: boolean;
        data: {
            layout?: unknown;
            page?: unknown;
            meta?: unknown;
        };
        children: TRoute[];
    }) => TRoute;
}

/**
 * 判断段是否影响 URL 模式
 */
const affects = (seg: Segment): boolean => {
    const t = seg.type;
    return t === 'static' || t === 'dynamic' || t === 'catchAll' || t === 'optionalCatchAll';
};

/**
 * 判断是否为索引段
 */
const isRoot = (seg: Segment): boolean => seg.type === 'static' && seg.raw === '';

/**
 * 获取组件路径
 */
const get = (node: RouteNode, key: string): string | undefined =>
    (node.components as Record<string, string>)?.[key];

/**
 * 生成 URL 模式
 */
const pattern = (segs: readonly Segment[], fmt: (s: Segment) => string): string =>
    '/' + segs.filter(affects).map(fmt).join('/');

/**
 * 创建上下文
 */
const context = <T extends string>(
    node: RouteNode<T>,
    segs: readonly Segment[],
    layouts: readonly string[],
    middlewares: readonly string[],
    fmt: (s: Segment) => string
): Context<T> => ({
    node,
    segments: segs,
    pattern: pattern(segs, fmt),
    layouts,
    middlewares,
});

/**
 * 定义适配器
 *
 * @typeParam TRoute - 目标路由类型
 * @typeParam TOptions - 选项类型
 * @param adapter - 适配器定义
 * @returns 适配函数
 *
 * @example
 * ```typescript
 * const adapt = define<Route, Options>({
 *     format: (seg) => seg.raw,
 *     resolve: (node, opts, ctx) => ({ page: node.components.page }),
 *     create: ({ path, data }) => ({ path, component: data.page }),
 * });
 * ```
 */
export function define<TRoute, TOptions>(adapter: Adapter<TRoute, TOptions>) {
    return function adapt(tree: RouteTree, options: TOptions = {} as TOptions): TRoute[] {
        const walk = (
            node: RouteNode,
            segs: readonly Segment[],
            layouts: readonly string[],
            middlewares: readonly string[]
        ): TRoute[] => {
            const chain = [...segs, node.segment];
            const layout = get(node, 'layout');
            const mw = node.middleware;

            const nextLayouts = layout ? [...layouts, layout] : layouts;
            const nextMw = mw ? [...middlewares, mw] : middlewares;

            // 递归子节点
            const children: TRoute[] = [];
            for (const child of node.children) {
                children.push(...walk(child, chain, nextLayouts, nextMw));
            }
            if (node.slots) {
                for (const slot of Object.values(node.slots)) {
                    children.push(...walk(slot, chain, nextLayouts, nextMw));
                }
            }
            if (node.intercepts) {
                for (const it of node.intercepts) {
                    children.push(...walk(it, chain, nextLayouts, nextMw));
                }
            }

            const dynamic = affects(node.segment) && !isRoot(node.segment);
            const slug = dynamic ? adapter.format(node.segment) : '';
            const root = isRoot(node.segment);

            const ctx = context(node, chain, nextLayouts, nextMw, adapter.format);
            const resolved = adapter.resolve(node, options, ctx);

            // 非动态静态段直接返回子节点
            if (!dynamic && !root) {
                return children;
            }

            const path = root ? '/' : slug;

            if (resolved.layout) {
                const idx = resolved.page
                    ? [adapter.create({ path: '', index: true, data: { ...resolved, layout: undefined }, children: [] })]
                    : [];

                return [
                    adapter.create({
                        path,
                        index: false,
                        data: { ...resolved, page: undefined },
                        children: [...idx, ...children],
                    }),
                ];
            }

            if (resolved.page || children.length > 0) {
                return [
                    adapter.create({
                        path,
                        index: false,
                        data: resolved,
                        children: children.length > 0 ? children : [],
                    }),
                ];
            }

            return [];
        };

        return walk(tree.root, [], [], []);
    };
}
