/**
 * 宿主适配器
 *
 * 定义宿主侧框架适配规则
 */
import type { Adapter } from '@microlet/core';
import { define } from '@microlet/core';

/**
 * 宿主适配选项
 */
export interface HostOptions extends Adapter {
    /** 
     * 应用名称
     * @example 'sub-app'
     */
    name: string;
    /**
     * 应用入口 URL
     * @example 'http://localhost:3000'
     */
    entry: string;
    /**
     * 挂载容器
     * @example '#app'
     */
    container: string | HTMLElement;
    /** 预加载策略 */
    prefetch?: boolean | 'all' | 'hover';
    /** 应用激活后保持存活 */
    keepAlive?: boolean;
}

/**
 * 宿主适配结果
 */
export interface HostResult {
    /** 适配器名称 */
    name: string;
    /** 加载资源 */
    load: () => Promise<unknown>;
}

/**
 * 宿主适配器定义接口
 */
export interface HostAdapterDefinition {
    /**
     * 加载资源
     * @param ctx - 宿主选项
     */
    load: (ctx: HostOptions) => Promise<unknown>;
    /**
     * 获取生命周期
     * @param ctx - 宿主选项
     */
    lifecycle: (ctx: HostOptions) => HostResult;
}

/**
 * 宿主适配器
 *
 * @example
 * ```typescript
 * import { adapt } from '@microlet/host';
 *
 * // 使用适配器
 * const result = adapt.lifecycle({ 
 *   name: 'app1', 
 *   entry: '//localhost', 
 *   container: '#root' 
 * });
 * ```
 */
export const adapt = define<HostAdapterDefinition>({
    load: async (ctx: HostOptions) => {
        // 加载子应用资源
        // 这里假设 entry 是一个 fetchable URL
        return fetch(ctx.entry).then((res) => res.text());
    },
    lifecycle: (ctx: HostOptions) => ({
        name: ctx.name,
        load: async () => ({}),
    }),
});
