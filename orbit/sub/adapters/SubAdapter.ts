/**
 * 子应用适配器接口
 *
 * 定义子应用侧宿主桥接规则
 */
import type { Lifecycle } from '@orbit/core';

/**
 * 宿主类型
 */
export type HostType = 'qiankun' | 'wujie' | 'micro-app' | 'standalone';

/**
 * 子应用适配器配置
 */
export interface SubAdapterOptions {
    /** 应用名称 */
    name: string;
    /** 挂载函数 */
    mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
    /** 卸载函数 */
    unmount: () => void | Promise<void>;
    /** 更新函数 */
    update?: (props: Record<string, unknown>) => void | Promise<void>;
}

/**
 * 子应用适配器工厂
 */
export type SubAdapterFactory = (options: SubAdapterOptions) => Lifecycle;

/**
 * 检测当前宿主类型
 * @returns 宿主类型
 */
export function detectHost(): HostType {
    if (typeof window !== 'undefined') {
        if ((window as any).__POWERED_BY_QIANKUN__) return 'qiankun';
        if ((window as any).__POWERED_BY_WUJIE__) return 'wujie';
        if ((window as any).__MICRO_APP_ENVIRONMENT__) return 'micro-app';
    }
    return 'standalone';
}
