import { describe, it, expect } from 'vitest';
import { createSorter } from './sorter';
import type { RouteNode } from '../types/tree';
import type { Segment } from '../types/segment';

/**
 * 创建测试用路由节点
 */
function createNode(segment: Segment, children: RouteNode[] = []): RouteNode {
    return {
        segment,
        components: {},
        children,
    };
}

describe('createSorter', () => {
    const sorter = createSorter();

    describe('sort', () => {
        it('按优先级排序：静态 > 动态 > catch-all > optional catch-all', () => {
            const nodes: RouteNode[] = [
                createNode({ raw: '[[...all]]', type: 'optionalCatchAll', name: 'all' }),
                createNode({ raw: '[...slug]', type: 'catchAll', name: 'slug' }),
                createNode({ raw: '[id]', type: 'dynamic', name: 'id' }),
                createNode({ raw: 'blog', type: 'static' }),
            ];

            const sorted = sorter.sort(nodes);

            expect(sorted[0]!.segment.type).toBe('static');
            expect(sorted[1]!.segment.type).toBe('dynamic');
            expect(sorted[2]!.segment.type).toBe('catchAll');
            expect(sorted[3]!.segment.type).toBe('optionalCatchAll');
        });

        it('相同优先级时按字母顺序排序', () => {
            const nodes: RouteNode[] = [
                createNode({ raw: 'zebra', type: 'static' }),
                createNode({ raw: 'alpha', type: 'static' }),
                createNode({ raw: 'beta', type: 'static' }),
            ];

            const sorted = sorter.sort(nodes);

            expect(sorted[0]!.segment.raw).toBe('alpha');
            expect(sorted[1]!.segment.raw).toBe('beta');
            expect(sorted[2]!.segment.raw).toBe('zebra');
        });

        it('不修改原数组', () => {
            const nodes: RouteNode[] = [
                createNode({ raw: '[id]', type: 'dynamic', name: 'id' }),
                createNode({ raw: 'blog', type: 'static' }),
            ];

            const original = [...nodes];
            sorter.sort(nodes);

            expect(nodes).toEqual(original);
        });

        it('分组和并行路由按静态优先级处理', () => {
            const nodes: RouteNode[] = [
                createNode({ raw: '[id]', type: 'dynamic', name: 'id' }),
                createNode({ raw: '(auth)', type: 'group', name: 'auth' }),
                createNode({ raw: '@modal', type: 'parallel', name: 'modal' }),
            ];

            const sorted = sorter.sort(nodes);

            // group 和 parallel 优先级为 0，应在 dynamic 之前
            expect(sorted[0]!.segment.type).toBe('group');
            expect(sorted[1]!.segment.type).toBe('parallel');
            expect(sorted[2]!.segment.type).toBe('dynamic');
        });
    });

    describe('sortTree', () => {
        it('递归排序整棵树', () => {
            const tree: RouteNode = createNode(
                { raw: '', type: 'static' },
                [
                    createNode({ raw: '[id]', type: 'dynamic', name: 'id' }),
                    createNode(
                        { raw: 'blog', type: 'static' },
                        [
                            createNode({ raw: '[...slug]', type: 'catchAll', name: 'slug' }),
                            createNode({ raw: 'latest', type: 'static' }),
                        ]
                    ),
                ]
            );

            const sorted = sorter.sortTree(tree);

            // 第一层排序
            expect(sorted.children[0]!.segment.raw).toBe('blog');
            expect(sorted.children[1]!.segment.type).toBe('dynamic');

            // 第二层排序（blog 的子节点）
            expect(sorted.children[0]!.children[0]!.segment.raw).toBe('latest');
            expect(sorted.children[0]!.children[1]!.segment.type).toBe('catchAll');
        });

        it('排序插槽和拦截路由', () => {
            const tree: RouteNode = {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [],
                slots: {
                    modal: createNode(
                        { raw: '@modal', type: 'parallel', name: 'modal' },
                        [
                            createNode({ raw: '[id]', type: 'dynamic', name: 'id' }),
                            createNode({ raw: 'photo', type: 'static' }),
                        ]
                    ),
                },
                intercepts: [
                    createNode(
                        { raw: '(.)photo', type: 'interceptSame', name: 'photo' },
                        [
                            createNode({ raw: '[slug]', type: 'dynamic', name: 'slug' }),
                            createNode({ raw: 'edit', type: 'static' }),
                        ]
                    ),
                ],
            };

            const sorted = sorter.sortTree(tree);

            // 插槽内子节点排序
            expect(sorted.slots!['modal']!.children[0]!.segment.raw).toBe('photo');
            expect(sorted.slots!['modal']!.children[1]!.segment.type).toBe('dynamic');

            // 拦截路由内子节点排序
            expect(sorted.intercepts![0]!.children[0]!.segment.raw).toBe('edit');
            expect(sorted.intercepts![0]!.children[1]!.segment.type).toBe('dynamic');
        });
    });
});
