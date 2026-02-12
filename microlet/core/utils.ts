/**
 * 工具函数
 */

/**
 * 定义辅助函数
 *
 * @param config - 配置对象
 * @returns 配置对象
 *
 * @example
 * ```typescript
 * const config = define({ name: 'app' });
 * ```
 */
export function define<T>(config: T): T {
    return config;
}
