import {
    type RouteFile,
    type PresetName,
    type CoreFiles,
    type ErrorFiles,
    type ApiFiles,
    type MetaFiles,
    PRESETS,
    ALL_FILES,
} from './presets';

/**
 * 文件约定接口
 *
 * 定义路由文件识别规则。
 *
 * @typeParam T - 自定义文件类型，默认为 RouteFile
 */
export interface FileConvention<T extends string = RouteFile> {
    /** 支持的路由文件类型 */
    readonly files: readonly T[];

    /** 支持的文件扩展名 */
    readonly extensions: readonly string[];
}

/**
 * 约定定义选项
 *
 * @typeParam T - 自定义文件类型
 */
export interface ConventionOptions<T extends string = RouteFile> {
    /**
     * 启用的预设列表
     * @default ['core', 'error', 'api', 'meta'] （全部预设）
     */
    presets?: PresetName[];

    /**
     * 额外包含的文件类型（用于扩展）
     */
    include?: readonly T[];

    /**
     * 排除的文件类型
     */
    exclude?: readonly string[];

    /**
     * 支持的文件扩展名
     * @default ['.tsx', '.ts', '.jsx', '.js']
     */
    extensions?: readonly string[];
}

/** 默认扩展名 */
const DEFAULT_EXTENSIONS: readonly string[] = [
    // Logic
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
    // Data
    '.json',
    '.xml',
    '.txt',
    // Images
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
];

/** 所有预设名称 */
const ALL_PRESETS: PresetName[] = ['core', 'error', 'api', 'meta'];

/**
 * 创建文件约定
 *
 * 通过预设组合和自定义扩展来定义文件识别规则。
 *
 * @typeParam T - 自定义文件类型
 * @param options - 约定配置选项
 * @returns 文件约定对象
 *
 * @example
 * ```typescript
 * // 使用全部预设（默认）
 * const defaultConvention = defineConvention();
 *
 * // 仅核心 + 错误处理
 * const minimalConvention = defineConvention({
 *     presets: ['core', 'error'],
 * });
 *
 * // 添加自定义类型
 * type CustomFile = RouteFile | 'analytics';
 * const customConvention = defineConvention<CustomFile>({
 *     include: ['analytics'],
 * });
 *
 * // 排除不需要的类型
 * const noApiConvention = defineConvention({
 *     exclude: ['route', 'middleware'],
 * });
 * ```
 */
export const defineConvention = <T extends string = RouteFile>(
    options: ConventionOptions<T> = {}
): FileConvention<T> => {
    const {
        presets = ALL_PRESETS,
        include = [],
        exclude = [],
        extensions = DEFAULT_EXTENSIONS,
    } = options;

    // 从预设收集文件类型
    const filesFromPresets = presets.flatMap(preset => PRESETS[preset] ?? []);

    // 合并预设和自定义类型，去重
    const allFiles = [...new Set([...filesFromPresets, ...include])];

    // 排除指定类型
    const filteredFiles = allFiles.filter(file => !exclude.includes(file));

    return {
        files: filteredFiles as unknown as readonly T[],
        extensions,
    };
};

// 重新导出预设类型
export type { RouteFile, PresetName, CoreFiles, ErrorFiles, ApiFiles, MetaFiles };
export { PRESETS, ALL_FILES };
