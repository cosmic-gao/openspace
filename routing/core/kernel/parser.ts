import type { Segment } from '../types/index.ts';

/**
 * 段解析器接口
 */
export interface SegmentParser {
    /**
     * 解析目录名为段对象
     *
     * @param raw - 原始目录名
     * @returns 解析后的段对象
     */
    parse(raw: string): Segment;
}

/** 可选捕获段正则：[[...name]] */
const OPTIONAL_CATCH_ALL = /^\[\[\.\.\.(\w+)\]\]$/;

/** 捕获所有段正则：[...name] */
const CATCH_ALL = /^\[\.\.\.(\w+)\]$/;

/** 动态段正则：[name] */
const DYNAMIC = /^\[(\w+)\]$/;

/** 分组正则：(name) */
const GROUP = /^\((\w+)\)$/;

/** 并行路由正则：@name */
const PARALLEL = /^@(\w+)$/;

/** 根级拦截正则：(...)name */
const INTERCEPT_ROOT = /^\(\.\.\.\)(\w+)$/;

/** 父级拦截正则：(..)name 或 (..)(..)name 等 */
const INTERCEPT_PARENT = /^(\(\.\.?\))+(\w+)$/;

/** 同级拦截正则：(.)name */
const INTERCEPT_SAME = /^\(\.\)(\w+)$/;

/**
 * 默认段解析器
 *
 * @example
 * ```typescript
 * const parser = createParser();
 * parser.parse('blog');        // { raw: 'blog', type: 'static' }
 * parser.parse('[id]');        // { raw: '[id]', type: 'dynamic', name: 'id' }
 * parser.parse('(..)photo');   // { raw: '(..)photo', type: 'interceptParent', name: 'photo', level: 1 }
 * ```
 */
export function createParser(): SegmentParser {
    return {
        parse(raw: string): Segment {
            const firstChar = raw[0];
            let match: RegExpMatchArray | null;

            // 快速路径检查
            if (firstChar === '[') {
                // 可选捕获：[[...slug]]
                match = raw.match(OPTIONAL_CATCH_ALL);
                if (match) {
                    return { raw, type: 'optionalCatchAll', name: match[1] };
                }

                // 捕获所有：[...slug]
                match = raw.match(CATCH_ALL);
                if (match) {
                    return { raw, type: 'catchAll', name: match[1] };
                }

                // 动态段：[id]
                match = raw.match(DYNAMIC);
                if (match) {
                    return { raw, type: 'dynamic', name: match[1] };
                }
            } else if (firstChar === '(') {
                // 根级拦截：(...)photo
                match = raw.match(INTERCEPT_ROOT);
                if (match) {
                    return { raw, type: 'interceptRoot', name: match[1], level: Infinity };
                }

                // 同级拦截：(.)photo
                match = raw.match(INTERCEPT_SAME);
                if (match) {
                    return { raw, type: 'interceptSame', name: match[1], level: 0 };
                }

                // 父级拦截：(..)photo
                match = raw.match(INTERCEPT_PARENT);
                if (match) {
                    const level = (match[0].match(/\(\.\.\)/g) || []).length;
                    return { raw, type: 'interceptParent', name: match[2], level };
                }

                // 分组：(admin)
                match = raw.match(GROUP);
                if (match) {
                    return { raw, type: 'group', name: match[1] };
                }
            } else if (firstChar === '@') {
                // 并行路由：@modal
                match = raw.match(PARALLEL);
                if (match) {
                    return { raw, type: 'parallel', name: match[1] };
                }
            }

            // 静态段（默认）
            return { raw, type: 'static' };
        },
    };
}
