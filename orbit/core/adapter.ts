/**
 * 适配器工厂
 *
 * 定义宿主/子应用适配器的创建模式
 */
import type { AdapterOptions } from './types';

/**
 * 适配上下文
 */
export interface Context {
    /** 应用名称 */
    readonly name: string;
    /** 应用入口 */
    readonly entry: string;
    /** 挂载容器 */
    readonly container: string | HTMLElement;
}

/**
 * 适配器定义
 */
export interface AdapterDefinition<TResult, TOptions> {
    /** 加载资源 */
    load: (ctx: Context, options: TOptions) => Promise<unknown>;
    /** 创建沙箱 */
    sandbox?: (ctx: Context, options: TOptions) => unknown;
    /** 创建生命周期 */
    lifecycle: (ctx: Context, options: TOptions, loaded: unknown) => TResult;
}

/**
 * 定义适配器
 *
 * @typeParam TResult - 适配结果类型
 * @typeParam TOptions - 选项类型
 * @param definition - 适配器定义
 * @returns 适配函数
 *
 * @example
 * ```typescript
 * const adapt = define<Lifecycle, Options>({
 *     load: async (ctx) => fetch(ctx.entry),
 *     lifecycle: (ctx, opts, loaded) => ({ mount: () => {}, unmount: () => {} }),
 * });
 * ```
 */
export function define<TResult, TOptions = AdapterOptions>(
    definition: AdapterDefinition<TResult, TOptions>
) {
    return async function adapt(ctx: Context, options: TOptions = {} as TOptions): Promise<TResult> {
        const loaded = await definition.load(ctx, options);
        if (definition.sandbox) {
            definition.sandbox(ctx, options);
        }
        return definition.lifecycle(ctx, options, loaded);
    };
}
