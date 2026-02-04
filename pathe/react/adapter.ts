import type { Segment } from '@routing/core/types';
import type { Context, Resolver, Mapper } from '@routing/core/adapter';
import { define } from '@routing/core/adapter';

/**
 * React 路由对象
 */
export interface Route {
    readonly id?: string;
    readonly path?: string;
    readonly index?: boolean;
    readonly element?: unknown;
    readonly Component?: unknown;
    readonly children?: readonly Route[];
    readonly handle?: unknown;
}

/**
 * React 适配选项
 */
export interface Options<T extends string = string> {
    /** Element 解析器 */
    readonly element?: Resolver<unknown, T>;
    /** Component 解析器 */
    readonly component?: Resolver<unknown, T>;
    /** Handle 映射器 */
    readonly handle?: Mapper<unknown, T>;
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
        case 'optionalCatchAll':
            return '*';
        default:
            return '';
    }
};

/**
 * 默认 handle
 */
const defaults = (ctx: Context): unknown => ({
    routing: {
        pattern: ctx.pattern,
        segment: ctx.node.segment,
        layouts: ctx.layouts,
        middlewares: ctx.middlewares,
        components: ctx.node.components,
        middleware: ctx.node.middleware,
    },
});

/**
 * 组件数据
 */
interface Data {
    element?: unknown;
    component?: unknown;
}

/**
 * 转换为 React 路由
 *
 * @param tree - 路由树
 * @param options - 适配选项
 * @returns React 路由数组
 *
 * @example
 * ```typescript
 * import { adapt } from '@routing/react';
 *
 * const routes = adapt(tree, {
 *     element: (path) => <Lazy path={path} />,
 *     component: (path) => lazy(() => import(path)),
 * });
 * ```
 */
export const adapt = define<Route, Options>({
    format,
    resolve: (node, opts, ctx) => {
        const elem = opts.element ?? ((p) => p);
        const comp = opts.component ?? ((p) => p);
        const mapper = opts.handle ?? defaults;

        const cmps = node.components as Record<string, string>;
        const layout = cmps?.['layout'];
        const page = cmps?.['page'];

        const data = (path: string, type: 'page' | 'layout'): Data => ({
            element: elem(path, type, ctx),
            component: comp(path, type, ctx),
        });

        return {
            layout: layout ? data(layout, 'layout') : undefined,
            page: page ? data(page, 'page') : undefined,
            meta: mapper(ctx),
        };
    },
    create: ({ path, index, data, children }) => {
        const d = (data['layout'] ?? data['page']) as Data | undefined;

        if (index) {
            return {
                index: true,
                element: d?.element,
                Component: d?.component,
                handle: data['meta'],
            };
        }

        return {
            path,
            element: d?.element,
            Component: d?.component,
            children: children.length > 0 ? children : undefined,
            handle: data['meta'],
        };
    },
});
