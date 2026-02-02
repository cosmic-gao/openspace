import type { RouteFile } from './tree';

/**
 * 文件约定接口
 *
 * 定义路由文件识别规则。
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 *
 * @example
 * ```typescript
 * // 使用默认约定
 * const convention: FileConvention = {
 *   files: ['page', 'layout', 'loading', 'error'],
 *   extensions: ['.tsx', '.ts', '.jsx', '.js'],
 * };
 *
 * // 使用扩展约定
 * type CustomFile = RouteFile | 'meta';
 * const customConvention: FileConvention<CustomFile> = {
 *   files: ['page', 'layout', 'meta'],
 *   extensions: ['.tsx', '.ts'],
 * };
 * ```
 */
export interface FileConvention<T extends string = RouteFile> {
    /** 支持的路由文件类型 */
    readonly files: readonly T[];

    /** 支持的文件扩展名 */
    readonly extensions: readonly string[];
}
