import type { App, Lifecycle } from './types';

/**
 * 资源加载器
 */
export interface Loader {
    /**
     * 加载资源
     *
     * @param app - 应用元数据
     * @returns 加载结果（通常是脚本执行结果或模块导出）
     */
    load(app: App): Promise<unknown>;
}

/**
 * 沙箱环境
 */
export interface Sandbox {
    /**
     * 创建沙箱
     *
     * @param app - 应用元数据
     * @returns 沙箱实例
     */
    create(app: App): unknown;

    /**
     * 激活沙箱
     */
    active?(): void;

    /**
     * 销毁沙箱
     */
    destroy?(): void;
}

/**
 * Orbit 插件
 */
export interface OrbitPlugin {
    /** 插件名称 */
    name: string;
    /** 安装插件 */
    install: (orbit: unknown) => void;
}

/**
 * 适配器接口
 *
 * 组合 Loader 和 Sandbox，负责从资源中提取生命周期
 */
export interface Adapter {
    /** 加载器 */
    loader: Loader;
    /** 沙箱（可选） */
    sandbox?: Sandbox;
    /**
     * 获取生命周期
     *
     * @param app - 应用元数据
     * @param loaded - 加载结果
     * @returns 生命周期钩子
     */
    lifecycle(app: App, loaded: unknown): Promise<Lifecycle>;
}
