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
 * 将路由 pattern 转换为正则表达式
 *
 * @param pattern - URL 模式
 * @returns 正则表达式和参数名列表
 */
function patternToRegex(pattern: string): { regex: RegExp; params: string[] } {
    const params: string[] = [];
    let regexStr = pattern
        // 可选捕获：:name*
        .replace(/:(\w+)\*/g, (_, name) => {
            params.push(name);
            return '(.*)';
        })
        // 捕获所有：:name+
        .replace(/:(\w+)\+/g, (_, name) => {
            params.push(name);
            return '(.+)';
        })
        // 动态段：:name
        .replace(/:(\w+)/g, (_, name) => {
            params.push(name);
            return '([^/]+)';
        });

    return {
        regex: new RegExp(`^${regexStr}$`),
        params,
    };
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
            const { regex, params: paramNames } = patternToRegex(route.pattern);
            const match = path.match(regex);

            if (!match) {
                return null;
            }

            const params: Record<string, string | string[]> = {};

            for (let i = 0; i < paramNames.length; i++) {
                const name = paramNames[i]!;
                const value = match[i + 1];

                // 检查是否为捕获所有段（包含斜杠）
                if (value?.includes('/')) {
                    params[name] = value.split('/').filter(Boolean);
                } else if (value !== undefined) {
                    params[name] = value;
                }
            }

            return { route, params };
        },
    };
}
