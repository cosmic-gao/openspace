/**
 * 核心事件定义
 */

import type { App, AppStatus } from './types';

/**
 * 核心事件映射表
 */
/**
 * 核心事件映射表
 */
export type MicroletEvents = {
    /** 错误事件 */
    error: Error;
    /** 应用注册 */
    'app:registered': App;
    /** 状态变更 */
    'app:status-change': { app: App; from: AppStatus; to: AppStatus };
    /** 资源加载前 */
    'app:before-load': App;
    /** 资源加载后 */
    'app:loaded': App;
    /** 初始挂载前 */
    'app:before-mount': App;
    /** 挂载后 */
    'app:mounted': App;
    /** 卸载前 */
    'app:before-unmount': App;
    /** 卸载后 */
    'app:unmounted': App;
};

/**
 * 事件处理器
 */
export type Handler<T = unknown> = (event: T) => void;

/**
 * 事件中心接口
 */
export interface EventBus {
    on<Key extends keyof MicroletEvents>(type: Key, handler: Handler<MicroletEvents[Key]>): void;
    off<Key extends keyof MicroletEvents>(type: Key, handler: Handler<MicroletEvents[Key]>): void;
    emit<Key extends keyof MicroletEvents>(type: Key, event: MicroletEvents[Key]): void;
}

/**
 * 创建简单的事件中心
 *
 * @returns 事件总线实例
 *
 * @internal
 *
 * @example
 * ```typescript
 * const bus = createEventBus();
 * bus.on('error', (err) => console.error(err));
 * bus.emit('error', new Error('Something went wrong'));
 * ```
 */
export function createEventBus(): EventBus {
    const all = new Map<keyof MicroletEvents, Handler[]>();

    return {
        on(type, handler) {
            const handlers = all.get(type);
            if (handlers) {
                handlers.push(handler as Handler);
            } else {
                all.set(type, [handler as Handler]);
            }
        },
        off(type, handler) {
            const handlers = all.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler as Handler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            }
        },
        emit(type, event) {
            const handlers = all.get(type);
            if (handlers) {
                for (const handler of handlers.slice()) {
                    try {
                        handler(event);
                    } catch (e) {
                        console.error(`[Microlet] Error in event handler for "${String(type)}":`, e);
                    }
                }
            }
        },
    };
}
