import { describe, it, expect } from 'vitest';
import { adapt, type Route } from './index';
import type { RouteTree, RouteNode } from '../../types/tree';
import type { Segment } from '../../types/segment';

function createNode(
    segment: Segment,
    components: Record<string, string> = {},
    children: RouteNode[] = []
): RouteNode {
    return { segment, components, children };
}

describe('adapt', () => {
    it('maps layout and index page', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                { layout: '/app/layout.tsx', page: '/app/page.tsx' },
                [
                    createNode(
                        { raw: 'blog', type: 'static' },
                        { page: '/app/blog/page.tsx' }
                    ),
                ]
            ),
        };

        const routes = adapt(tree, {
            element: (path: string, type: string) => ({
                path,
                type,
            }),
        });

        expect(routes).toHaveLength(1);
        expect(routes[0]?.path).toBe('/');

        const children = routes[0]?.children ?? [];
        expect(children.some((r: Route) => r.index === true)).toBe(true);
        expect(children.some((r: Route) => r.path === 'blog')).toBe(true);
    });

    it('maps catch-all and optional catch-all segments to splat', () => {
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
                                { page: '/app/shop/[...path]/page.tsx' }
                            ),
                        ]
                    ),
                    createNode(
                        { raw: 'docs', type: 'static' },
                        {},
                        [
                            createNode(
                                { raw: '[[...slug]]', type: 'optionalCatchAll', name: 'slug' },
                                { page: '/app/docs/[[...slug]]/page.tsx' }
                            ),
                        ]
                    ),
                ]
            ),
        };

        const routes = adapt(tree);
        const rootChildren = routes[0]?.children ?? [];

        const shop = rootChildren.find((r: Route) => r.path === 'shop');
        expect(shop).toBeDefined();
        expect(shop?.children?.[0]?.path).toBe('*');

        const docs = rootChildren.find((r: Route) => r.path === 'docs');
        expect(docs).toBeDefined();
        expect(docs?.children?.[0]?.path).toBe('*');
    });

    it('ignores group segments in path', () => {
        const tree: RouteTree = {
            root: createNode(
                { raw: '', type: 'static' },
                {},
                [
                    createNode(
                        { raw: '(auth)', type: 'group', name: 'auth' },
                        {},
                        [
                            createNode(
                                { raw: 'login', type: 'static' },
                                { page: '/app/(auth)/login/page.tsx' }
                            ),
                        ]
                    ),
                ]
            ),
        };

        const routes = adapt(tree);
        const rootChildren = routes[0]?.children ?? [];
        expect(rootChildren.some((r: Route) => r.path === 'login')).toBe(true);
    });
});
