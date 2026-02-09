import type { App } from './App';
import type { Lifecycle } from './Lifecycle';

/**
 * 框架适配器接口
 *
 * 用于扩展不同微前端框架的支持，如 qiankun、wujie、micro-app 等
 */
export interface Adapter {
    /** 适配器名称 */
    name: string;

    /**
     * 加载微应用资源
     * @param app 微应用定义
     * @returns 生命周期钩子
     */
    load(app: App): Promise<Lifecycle>;

    /**
     * 创建沙箱环境
     * @param app 微应用定义
     * @returns 沙箱实例
     */
    createSandbox?(app: App): Promise<Sandbox>;

    /**
     * 销毁沙箱环境
     * @param sandbox 沙箱实例
     */
    destroySandbox?(sandbox: Sandbox): Promise<void>;
}

/**
 * 沙箱接口
 */
export interface Sandbox {
    /** 沙箱名称 */
    name: string;
    /** 沙箱代理的全局对象 */
    proxy: WindowProxy;
    /** 激活沙箱 */
    activate(): void;
    /** 停用沙箱 */
    deactivate(): void;
}

/**
 * 适配器工厂函数类型
 */
export type AdapterFactory = (options?: AdapterOptions) => Adapter;

/**
 * 适配器配置选项
 */
export interface AdapterOptions {
    /** 是否启用严格沙箱模式 */
    strictSandbox?: boolean;
    /** 是否启用 CSS 隔离 */
    cssIsolation?: boolean;
    /** 自定义 fetch 函数 */
    fetch?: typeof fetch;
}
