import type { RouteFile } from './tree';

/**
 * 文件约定接口
 *
 * 定义路由文件识别规则。
 *
 * @example
 * ```typescript
 * const convention: FileConvention = {
 *   files: ['page', 'layout', 'loading', 'error'],
 *   extensions: ['.tsx', '.ts', '.jsx', '.js'],
 * };
 * ```
 */
export interface FileConvention {
    /** 支持的路由文件类型 */
    readonly files: readonly RouteFile[];

    /** 支持的文件扩展名 */
    readonly extensions: readonly string[];
}
