import type { App } from './App';

/**
 * 生命周期钩子函数签名
 */
export type LifecycleHook<T = void> = (app: App, props?: Record<string, unknown>) => Promise<T>;

/**
 * 微应用生命周期接口
 */
export interface Lifecycle {
    /** 应用加载钩子 */
    load?: LifecycleHook;
    /** 应用初始化钩子 */
    bootstrap?: LifecycleHook;
    /** 应用挂载钩子 */
    mount?: LifecycleHook;
    /** 应用更新钩子 */
    update?: LifecycleHook;
    /** 应用卸载钩子 */
    unmount?: LifecycleHook;
    /** 应用销毁钩子 */
    unload?: LifecycleHook;
}

/**
 * 生命周期事件类型
 */
export type LifecycleEvent =
    | 'beforeLoad'
    | 'afterLoad'
    | 'beforeBootstrap'
    | 'afterBootstrap'
    | 'beforeMount'
    | 'afterMount'
    | 'beforeUpdate'
    | 'afterUpdate'
    | 'beforeUnmount'
    | 'afterUnmount'
    | 'beforeUnload'
    | 'afterUnload'
    | 'error';
