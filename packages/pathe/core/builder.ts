import type { Segment, Route } from '../types';

/**
 * 路由构建器接口
 */
export interface RouteBuilder {
    /**
     * 从段列表构建路由
     *
     * @param segments - 段列表
     * @returns 构建的路由
     */
    build(segments: Segment[]): Route;
}

/**
 * 默认路由构建器
 *
 * @example
 * ```typescript
 * const builder = createBuilder();
 * const route = builder.build([
 *   { raw: 'blog', type: 'static' },
 *   { raw: '[id]', type: 'dynamic', name: 'id' },
 * ]);
 * // route.pattern === '/blog/:id'
 * ```
 */
export function createBuilder(): RouteBuilder {
    return {
        build(segments: Segment[]): Route {
            const parts: string[] = [];

            for (const segment of segments) {
                switch (segment.type) {
                    case 'static':
                        parts.push(segment.raw);
                        break;

                    case 'dynamic':
                        parts.push(`:${segment.name}`);
                        break;

                    case 'catchAll':
                        parts.push(`:${segment.name}+`);
                        break;

                    case 'optionalCatchAll':
                        parts.push(`:${segment.name}*`);
                        break;

                    case 'group':
                    case 'parallel':
                        // 分组和并行路由不影响 URL
                        break;
                }
            }

            const pattern = '/' + parts.join('/');

            return { segments, pattern };
        },
    };
}
