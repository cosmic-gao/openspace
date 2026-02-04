import { describe, it, expect } from 'vitest';
import { createCollector, generatePath } from './static';
import type { RouteTree, RouteNode, RouteFile } from '../types/tree';
import type { Segment } from '../types/segment';

/**
 * 创建测试用路由节点
 */
function createNode(
    segment: Segment,
    components: Partial<Record<RouteFile, string>> = {},
    children: RouteNode[] = []
): RouteNode {
    return {
        segment,
        components,
        children,
    };
}

describe('createCollector', () => {
    const collector = createCollector();

    it('收集动态路由信息', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                { layout: '/layout.tsx' },
                [
                    createNode(
                        { raw: 'blog', type: 'static' },
                        {},
                        [
                            createNode(
                                { raw: '[slug]', type: 'dynamic', name: 'slug' },
                                { page: '/blog/[slug]/page.tsx' }
                            ),
                        ]
                    ),
                ]
            ),
        };

        const routes = collector.collect(tree);

        expect(routes).toHaveLength(1);
        expect(routes[0]!.pattern).toBe('/blog/:slug');
        expect(routes[0]!.paramNames).toEqual(['slug']);
        expect(routes[0]!.component).toBe('/blog/[slug]/page.tsx');
    });

    it('收集 catch-all 路由', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                {},
                [
                    createNode(
                        { raw: 'shop', type: 'static' },
                        {},
                        [
                            createNode(
                                { raw: '[...path]', type: 'catchAll', name: 'path' },
                                { page: '/shop/[...path]/page.tsx' }
                            ),
                        ]
                    ),
                ]
            ),
        };

        const routes = collector.collect(tree);

        expect(routes).toHaveLength(1);
        expect(routes[0]!.pattern).toBe('/shop/:path+');
        expect(routes[0]!.paramNames).toEqual(['path']);
    });

    it('忽略无动态段的路由', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                {},
                [
                    createNode(
                        { raw: 'about', type: 'static' },
                        { page: '/about/page.tsx' }
                    ),
                ]
            ),
        };

        const routes = collector.collect(tree);

        expect(routes).toHaveLength(0);
    });

    it('忽略无 page 组件的动态路由', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                {},
                [
                    createNode(
                        { raw: '[id]', type: 'dynamic', name: 'id' },
                        { layout: '/[id]/layout.tsx' } // 只有 layout，没有 page
                    ),
                ]
            ),
        };

        const routes = collector.collect(tree);

        expect(routes).toHaveLength(0);
    });

    it('收集多个动态参数', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                {},
                [
                    createNode(
                        { raw: '[category]', type: 'dynamic', name: 'category' },
                        {},
                        [
                            createNode(
                                { raw: '[product]', type: 'dynamic', name: 'product' },
                                { page: '/[category]/[product]/page.tsx' }
                            ),
                        ]
                    ),
                ]
            ),
        };

        const routes = collector.collect(tree);

        expect(routes).toHaveLength(1);
        expect(routes[0]!.pattern).toBe('/:category/:product');
        expect(routes[0]!.paramNames).toEqual(['category', 'product']);
    });
});

describe('generatePath', () => {
    it('替换动态段', () => {
        const path = generatePath('/blog/:slug', { slug: 'hello-world' });
        expect(path).toBe('/blog/hello-world');
    });

    it('替换多个动态段', () => {
        const path = generatePath('/:category/:product', {
            category: 'electronics',
            product: 'phone',
        });
        expect(path).toBe('/electronics/phone');
    });

    it('替换 catch-all 段', () => {
        const path = generatePath('/shop/:path+', {
            path: ['electronics', 'phones', 'iphone'],
        });
        expect(path).toBe('/shop/electronics/phones/iphone');
    });

    it('替换可选 catch-all 段', () => {
        const path = generatePath('/docs/:slug*', {
            slug: ['guide', 'getting-started'],
        });
        expect(path).toBe('/docs/guide/getting-started');
    });

    it('空数组抛出错误', () => {
        expect(() => generatePath('/docs/:slug*', { slug: [] }))
            .toThrow('Empty array for catch-all parameter: slug');
    });

    it('缺少参数抛出错误', () => {
        expect(() => generatePath('/blog/:slug', {}))
            .toThrow('Missing required parameters: :slug');
    });

    it('降级模式返回未替换的模式', () => {
        const path = generatePath('/blog/:slug', {}, { throwOnMissing: false });
        expect(path).toBe('/blog/:slug');
    });
});
