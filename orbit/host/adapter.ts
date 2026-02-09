/**
 * 宿主适配器
 *
 * 定义宿主侧框架适配规则
 */
import type { AdapterOptions } from '@orbit/core';
import { define } from '@orbit/core';

/**
 * 宿主适配选项
 */
export interface HostOptions extends AdapterOptions {
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
 * 宿主适配器
 *
 * @example
 * ```typescript
 * import { adapt } from '@orbit/host';
 *
 * const lifecycle = await adapt(
 *     { name: 'sub-app', entry: 'http://localhost:3001', container: '#app' },
 *     { prefetch: true }
 * );
 * ```
 */
export const adapt = define<HostResult, HostOptions>({
    load: async (ctx) => {
        // 加载子应用资源
        return fetch(ctx.entry).then((res) => res.text());
    },
    lifecycle: (ctx) => ({
        name: ctx.name,
        load: async () => ({}),
    }),
});
