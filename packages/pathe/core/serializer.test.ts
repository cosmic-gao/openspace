import { describe, it, expect } from 'vitest';
import { serialize, deserialize } from './serializer';
import type { RouteTree } from '../types/tree';

describe('Serializer', () => {
    const tree: RouteTree = {
        root: {
            segment: { raw: '', type: 'static' },
            components: { layout: '/app/layout.tsx' },
            children: [
                {
                    segment: { raw: 'blog', type: 'static' },
                    components: { page: '/app/blog/page.tsx' },
                    children: [
                        {
                            segment: { raw: '[slug]', type: 'dynamic', name: 'slug' },
                            components: { page: '/app/blog/[slug]/page.tsx' },
                            children: [],
                        },
                    ],
                },
            ],
        },
    };

    it('should serialize tree to JSON', () => {
        const json = serialize(tree);
        expect(typeof json).toBe('string');
        expect(json).toContain('blog');
        expect(json).toContain('[slug]');
    });

    it('should deserialize JSON to tree', () => {
        const json = serialize(tree);
        const restored = deserialize(json);

        expect(restored.root.segment.type).toBe('static');
        expect(restored.root.children).toHaveLength(1);
        expect(restored.root.children[0]?.segment.raw).toBe('blog');
    });

    it('should throw on invalid JSON', () => {
        expect(() => deserialize('invalid')).toThrow();
    });

    it('should throw on invalid structure', () => {
        expect(() => deserialize('{"foo": "bar"}')).toThrow('Invalid RouteTree structure');
    });
});
