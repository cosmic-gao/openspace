/**
 * 宿主适配器接口
 *
 * 定义宿主侧框架适配规则
 */
import type { Adapter, AdapterOptions } from '@orbit/core';

/**
 * 宿主适配器配置
 */
export interface HostAdapterOptions extends AdapterOptions {
    /** 预加载策略 */
    prefetch?: boolean | 'all' | 'hover';
    /** 应用激活后保持存活 */
    keepAlive?: boolean;
}

/**
 * 宿主适配器工厂
 */
export type HostAdapterFactory = (options?: HostAdapterOptions) => Adapter;

/**
 * 宿主适配器声明
 */
export interface HostAdapterDeclaration {
    /** 适配器名称 */
    name: string;
    /** 适配器工厂 */
    factory: HostAdapterFactory;
}
