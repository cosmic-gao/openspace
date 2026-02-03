import type { Segment } from '../../types';
import type { Context, Resolver, Mapper } from '../define';
import { define } from '../define';

/**
 * Vue 路由记录
 */
export interface Route {
    readonly path: string;
    readonly name?: string;
    readonly component?: unknown;
    readonly components?: Readonly<Record<string, unknown>>;
    readonly children?: readonly Route[];
    readonly meta?: unknown;
}

/**
 * Vue 适配选项
 */
export interface Options<T extends string = string> {
    /** 组件解析器 */
    readonly resolve?: Resolver<unknown, T>;
    /** 元数据映射器 */
    readonly meta?: Mapper<unknown, T>;
}

/**
 * 格式化段
 */
const format = (seg: Segment): string => {
    switch (seg.type) {
        case 'static':
            return seg.raw;
        case 'dynamic':
            return `:${seg.name}`;
        case 'catchAll':
            return `:${seg.name}(.*)+`;
        case 'optionalCatchAll':
            return `:${seg.name}(.*)*`;
        default:
            return '';
    }
};

/**
 * 默认元数据
 */
const defaults = (ctx: Context): unknown => ({
    pathe: {
        pattern: ctx.pattern,
        segment: ctx.node.segment,
        layouts: ctx.layouts,
        middlewares: ctx.middlewares,
        components: ctx.node.components,
        middleware: ctx.node.middleware,
    },
});

/**
 * 转换为 Vue 路由
 *
 * @param tree - 路由树
 * @param options - 适配选项
 * @returns Vue 路由数组
 *
 * @example
 * ```typescript
 * import { adapt } from '@pathe/vue';
 *
 * const routes = adapt(tree, {
 *     resolve: (path) => () => import(path),
 * });
 * ```
 */
export const adapt = define<Route, Options>({
    format,
    resolve: (node, opts, ctx) => {
        const resolver = opts.resolve ?? ((p) => p);
        const mapper = opts.meta ?? defaults;

        const cmps = node.components as Record<string, string>;
        const layout = cmps?.['layout'];
        const page = cmps?.['page'];

        return {
            layout: layout ? resolver(layout, 'layout', ctx) : undefined,
            page: page ? resolver(page, 'page', ctx) : undefined,
            meta: mapper(ctx),
        };
    },
    create: ({ path, data, children }) => ({
        path,
        component: data['layout'] ?? data['page'],
        children: children.length > 0 ? children : undefined,
        meta: data['meta'],
    }),
});
