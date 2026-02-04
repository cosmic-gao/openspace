import { describe, it, expect } from 'vitest';
import { createValidator } from './validator';
import type { RouteTree } from '../types/tree';

describe('RouteValidator', () => {
    const validator = createValidator();

    it('should pass for valid tree', () => {
        const tree: RouteTree = {
            root: {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [
                    {
                        segment: { raw: 'blog', type: 'static' },
                        components: {},
                        children: [],
                    },
                    {
                        segment: { raw: 'about', type: 'static' },
                        components: {},
                        children: [],
                    },
                ],
            },
        };

        const result = validator.validate(tree);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate static segments', () => {
        const tree: RouteTree = {
            root: {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [
                    {
                        segment: { raw: 'blog', type: 'static' },
                        components: {},
                        children: [],
                    },
                    {
                        segment: { raw: 'blog', type: 'static' },
                        components: {},
                        children: [],
                    },
                ],
            },
        };

        const result = validator.validate(tree);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.type).toBe('DUPLICATE_STATIC');
    });

    it('should detect multiple dynamic segments', () => {
        const tree: RouteTree = {
            root: {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [
                    {
                        segment: { raw: '[id]', type: 'dynamic', name: 'id' },
                        components: {},
                        children: [],
                    },
                    {
                        segment: { raw: '[slug]', type: 'dynamic', name: 'slug' },
                        components: {},
                        children: [],
                    },
                ],
            },
        };

        const result = validator.validate(tree);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.type).toBe('MULTIPLE_DYNAMIC');
    });

    it('should detect dynamic and catch-all conflict', () => {
        const tree: RouteTree = {
            root: {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [
                    {
                        segment: { raw: '[id]', type: 'dynamic', name: 'id' },
                        components: {},
                        children: [],
                    },
                    {
                        segment: { raw: '[...slug]', type: 'catchAll', name: 'slug' },
                        components: {},
                        children: [],
                    },
                ],
            },
        };

        const result = validator.validate(tree);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.type === 'DYNAMIC_CATCH_CONFLICT')).toBe(true);
    });

    it('should detect multiple catch-all segments', () => {
        const tree: RouteTree = {
            root: {
                segment: { raw: '', type: 'static' },
                components: {},
                children: [
                    {
                        segment: { raw: '[...a]', type: 'catchAll', name: 'a' },
                        components: {},
                        children: [],
                    },
                    {
                        segment: { raw: '[[...b]]', type: 'optionalCatchAll', name: 'b' },
                        components: {},
                        children: [],
                    },
                ],
            },
        };

        const result = validator.validate(tree);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.type === 'MULTIPLE_CATCH_ALL')).toBe(true);
    });
});
