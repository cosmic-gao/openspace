import { describe, it, expect } from 'vitest';
import { createParser } from './parser';

describe('SegmentParser', () => {
    const parser = createParser();

    it('should parse static segments', () => {
        expect(parser.parse('blog')).toEqual({ raw: 'blog', type: 'static' });
    });

    it('should parse dynamic segments', () => {
        expect(parser.parse('[slug]')).toEqual({ raw: '[slug]', type: 'dynamic', name: 'slug' });
    });

    it('should parse catch-all segments', () => {
        expect(parser.parse('[...slug]')).toEqual({ raw: '[...slug]', type: 'catchAll', name: 'slug' });
    });

    it('should parse optional catch-all segments', () => {
        expect(parser.parse('[[...slug]]')).toEqual({ raw: '[[...slug]]', type: 'optionalCatchAll', name: 'slug' });
    });

    it('should parse group segments', () => {
        expect(parser.parse('(marketing)')).toEqual({ raw: '(marketing)', type: 'group', name: 'marketing' });
    });

    it('should parse parallel routes', () => {
        expect(parser.parse('@modal')).toEqual({ raw: '@modal', type: 'parallel', name: 'modal' });
    });

    it('should parse intercept routes (same level)', () => {
        expect(parser.parse('(.)photo')).toEqual({ raw: '(.)photo', type: 'interceptSame', name: 'photo', level: 0 });
    });

    it('should parse intercept routes (parent level)', () => {
        expect(parser.parse('(..)photo')).toEqual({ raw: '(..)photo', type: 'interceptParent', name: 'photo', level: 1 });
    });

    it('should parse intercept routes (multiple levels)', () => {
        expect(parser.parse('(..)(..)photo')).toEqual({ raw: '(..)(..)photo', type: 'interceptParent', name: 'photo', level: 2 });
    });

    it('should parse intercept routes (root)', () => {
        expect(parser.parse('(...)photo')).toEqual({ raw: '(...)photo', type: 'interceptRoot', name: 'photo', level: Infinity });
    });
});
