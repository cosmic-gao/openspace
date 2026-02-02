/**
 * 路由文件类型预设
 *
 * 将文件类型按语义分组，便于按需组合。
 */

// ============================================================================
// 类型预设
// ============================================================================

/** 核心路由文件（页面渲染必需） */
export type CoreFiles =
    | 'page'     // 页面入口
    | 'layout'   // 布局（嵌套共享）
    | 'template' // 模板（每次导航重新挂载）
    | 'loading'  // 加载状态
    | 'default'; // 并行路由默认状态

/** 错误处理文件 */
export type ErrorFiles =
    | 'error'  // 通用错误边界
    | '404';   // 404 页面

/** API 相关文件 */
export type ApiFiles =
    | 'route'      // API 端点
    | 'middleware'; // 中间件

/** 元数据文件 */
export type MetaFiles = 'metadata';

// ============================================================================
// 组合类型
// ============================================================================

/** 默认完整路由文件类型（向后兼容） */
export type RouteFile = CoreFiles | ErrorFiles | ApiFiles | MetaFiles;

// ============================================================================
// 预设常量
// ============================================================================

/** 预设名称 */
export type PresetName = 'core' | 'error' | 'api' | 'meta';

/** 核心文件预设 */
export const CORE_FILES: readonly CoreFiles[] = [
    'page',
    'layout',
    'template',
    'loading',
    'default',
] as const;

/** 错误处理文件预设 */
export const ERROR_FILES: readonly ErrorFiles[] = [
    'error',
    '404',
] as const;

/** API 文件预设 */
export const API_FILES: readonly ApiFiles[] = [
    'route',
    'middleware',
] as const;

/** 元数据文件预设 */
export const META_FILES: readonly MetaFiles[] = ['metadata'] as const;

/** 所有预设映射 */
export const PRESETS: Record<PresetName, readonly string[]> = {
    core: CORE_FILES,
    error: ERROR_FILES,
    api: API_FILES,
    meta: META_FILES,
} as const;

/** 所有默认文件（向后兼容） */
export const ALL_FILES: readonly RouteFile[] = [
    ...CORE_FILES,
    ...ERROR_FILES,
    ...API_FILES,
    ...META_FILES,
] as const;
