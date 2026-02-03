import type { Route, RouteMatch } from '../types';

/**
 * 路由匹配器接口
 */
export interface RouteMatcher {
    /**
     * 匹配 URL 路径
     *
     * @param path - URL 路径
     * @param route - 路由定义
     * @returns 匹配结果，不匹配返回 null
     */
    match(path: string, route: Route): RouteMatch | null;
}

/**
 * 转义正则特殊字符
 *
 * @param str - 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 编译结果缓存
 */
const cache = new Map<string, { regex: RegExp; names: string[] }>();

/**
 * 将路由 pattern 转换为正则表达式
 *
 * @param pattern - URL 模式
 * @returns 正则表达式和参数名列表
 */
function compile(pattern: string): { regex: RegExp; names: string[] } {
    if (cache.has(pattern)) {
        return cache.get(pattern)!;
    }

    const names: string[] = [];

    // 分割 pattern 为静态和动态部分
    // 捕获组: 1. 可选斜杠 2. 参数名 3. 可选装饰符(*, +)
    const parts = pattern.split(/(\/?:\w+[*+]?)/g);
    let expr = '';

    for (const part of parts) {
        const match = part.match(/^(\/?):(\w+)([*+]?)$/);

        if (match) {
            const [, slash, name, modifier] = match;
            names.push(name);

            if (slash) {
                // 带前导斜杠的情况
                switch (modifier) {
                    case '*': // Optional catch-all: /:name* -> (?:/(.*))?
                        expr += '(?:/(.*))?';
                        break;
                    case '+': // Catch-all: /:name+ -> /(.+)
                        expr += '/(.+)';
                        break;
                    default: // Dynamic: /:name -> /([^/]+)
                        expr += '/([^/]+)';
                        break;
                }
            } else {
                // 不带前导斜杠的情况 (通常在 path 开头或手动拼接)
                switch (modifier) {
                    case '*':
                        expr += '(.*)';
                        break;
                    case '+':
                        expr += '(.+)';
                        break;
                    default:
                        expr += '([^/]+)';
                        break;
                }
            }
        } else if (part) {
            // 静态段
            expr += escapeRegex(part);
        }
    }

    const result = {
        regex: new RegExp(`^${expr}$`),
        names,
    };

    cache.set(pattern, result);
    return result;
}

/**
 * 默认路由匹配器
 *
 * @example
 * ```typescript
 * const matcher = createMatcher();
 * const route = { segments: [...], pattern: '/blog/:id' };
 * const match = matcher.match('/blog/123', route);
 * // match.params === { id: '123' }
 * ```
 */
export function createMatcher(): RouteMatcher {
    return {
        match(path: string, route: Route): RouteMatch | null {
            const { regex, names } = compile(route.pattern);
            const match = path.match(regex);

            if (!match) {
                return null;
            }

            const params: Record<string, string | string[]> = {};

            for (let i = 0; i < names.length; i++) {
                const key = names[i]!;
                const value = match[i + 1];

                // 检查是否为捕获所有段（包含斜杠）
                if (value?.includes('/')) {
                    params[key] = value.split('/').filter(Boolean);
                } else if (value !== undefined) {
                    params[key] = value;
                }
            }

            return { route, params };
        },
    };
}
