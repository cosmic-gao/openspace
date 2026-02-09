/**
 * 微应用定义
 */
export interface App {
    /** 应用唯一标识 */
    name: string;
    /** 应用入口地址 */
    entry: string;
    /** 应用挂载容器选择器 */
    container: string | HTMLElement;
    /** 应用激活规则 */
    activeRule: string | ((location: Location) => boolean);
    /** 应用自定义属性 */
    props?: Record<string, unknown>;
}

/**
 * 已注册的微应用
 */
export interface RegisteredApp extends App {
    /** 应用状态 */
    status: AppStatus;
    /** 应用加载时间戳 */
    loadTime?: number;
}

/**
 * 微应用状态枚举
 */
export type AppStatus =
    | 'NOT_LOADED'
    | 'LOADING'
    | 'NOT_BOOTSTRAPPED'
    | 'BOOTSTRAPPING'
    | 'NOT_MOUNTED'
    | 'MOUNTING'
    | 'MOUNTED'
    | 'UPDATING'
    | 'UNMOUNTING'
    | 'UNLOADING'
    | 'LOAD_ERROR'
    | 'BOOTSTRAP_ERROR'
    | 'MOUNT_ERROR'
    | 'UNMOUNT_ERROR'
    | 'UNLOAD_ERROR';

/**
 * 应用错误
 */
export interface AppError extends Error {
    /** 错误发生的阶段/状态 */
    status: AppStatus;
    /** 关联的应用名称 */
    appName: string;
}
