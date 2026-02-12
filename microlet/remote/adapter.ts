/**
 * 子应用适配器
 *
 * 定义子应用侧框架适配规则
 */
import type { Lifecycle } from '@microlet/core';
import { detect } from './detect';

/**
 * 子应用适配选项
 */
export interface RemoteAppOptions {
    /** 应用名称 */
    name: string;
    /**
     * 挂载函数
     * @param container - 挂载容器
     * @param props - 自定义属性
     */
    mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
    /**
     * 卸载函数
     */
    unmount: () => void | Promise<void>;
    /**
     * 更新函数
     * @param props - 更新属性
     */
    update?: (props: Record<string, unknown>) => void | Promise<void>;
}

/**
 * 定义子应用
 *
 * @param options - 子应用配置
 * @returns 生命周期钩子
 *
 * @example
 * ```typescript
 * import { define } from '@microlet/remote';
 *
 * export const lifecycle = define({
 *     name: 'my-app',
 *     mount: (container) => app.mount(container),
 *     unmount: () => app.unmount(),
 * });
 * ```
 */
export function define(options: RemoteAppOptions): Lifecycle {
    // 检测宿主环境（可用于后续适配逻辑）
    detect();

    return {
        bootstrap: async () => {
            // 初始化
        },
        mount: async (app, props) => {
            const container =
                typeof app.container === 'string'
                    ? document.querySelector<HTMLElement>(app.container)
                    : app.container;
            if (container) {
                await options.mount(container, props);
            }
        },
        unmount: async () => {
            await options.unmount();
        },
        update: options.update
            ? async (_app, props) => {
                await options.update!(props ?? {});
            }
            : undefined,
    };
}
