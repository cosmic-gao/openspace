import { describe, it, expect } from 'vitest';
import { createBuilder } from './builder';
import type { Segment } from '../types/segment';

describe('RouteBuilder', () => {
    const builder = createBuilder();

    it('should build static segments', () => {
        const segments: Segment[] = [{ raw: 'blog', type: 'static' }];
        expect(builder.build(segments).pattern).toBe('/blog');
    });

    it('should build dynamic segments', () => {
        const segments: Segment[] = [
            { raw: 'blog', type: 'static' },
            { raw: '[id]', type: 'dynamic', name: 'id' }
        ];
        expect(builder.build(segments).pattern).toBe('/blog/:id');
    });

    it('should build catch-all segments', () => {
        const segments: Segment[] = [
            { raw: 'shop', type: 'static' },
            { raw: '[...slug]', type: 'catchAll', name: 'slug' }
        ];
        expect(builder.build(segments).pattern).toBe('/shop/:slug+');
    });

    it('should build optional catch-all segments', () => {
        const segments: Segment[] = [
            { raw: 'docs', type: 'static' },
            { raw: '[[...slug]]', type: 'optionalCatchAll', name: 'slug' }
        ];
        expect(builder.build(segments).pattern).toBe('/docs/:slug*');
    });

    it('should ignore group segments in pattern', () => {
        const segments: Segment[] = [
            { raw: '(marketing)', type: 'group', name: 'marketing' },
            { raw: 'about', type: 'static' }
        ];
        expect(builder.build(segments).pattern).toBe('/about');
    });

    it('should ignore parallel segments in pattern', () => {
        const segments: Segment[] = [
            { raw: 'dashboard', type: 'static' },
            { raw: '@settings', type: 'parallel', name: 'settings' }
        ];
        expect(builder.build(segments).pattern).toBe('/dashboard');
    });
});
