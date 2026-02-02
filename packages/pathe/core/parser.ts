import type { Segment } from '../types';

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

/**
 * 默认段解析器
 *
 * @example
 * ```typescript
 * const parser = createParser();
 * parser.parse('blog');        // { raw: 'blog', type: 'static' }
 * parser.parse('[id]');        // { raw: '[id]', type: 'dynamic', name: 'id' }
 * parser.parse('[...slug]');   // { raw: '[...slug]', type: 'catchAll', name: 'slug' }
 * ```
 */
export function createParser(): SegmentParser {
    return {
        parse(raw: string): Segment {
            let match: RegExpMatchArray | null;

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

            // 分组：(admin)
            match = raw.match(GROUP);
            if (match) {
                return { raw, type: 'group', name: match[1] };
            }

            // 并行路由：@modal
            match = raw.match(PARALLEL);
            if (match) {
                return { raw, type: 'parallel', name: match[1] };
            }

            // 静态段
            return { raw, type: 'static' };
        },
    };
}
