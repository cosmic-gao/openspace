/**
 * 核心事件定义
 */

import type { App, AppStatus } from './types';

/**
 * 核心事件映射表
 */
export type OrbitEvents = {
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
    on<Key extends keyof OrbitEvents>(type: Key, handler: Handler<OrbitEvents[Key]>): void;
    off<Key extends keyof OrbitEvents>(type: Key, handler: Handler<OrbitEvents[Key]>): void;
    emit<Key extends keyof OrbitEvents>(type: Key, event: OrbitEvents[Key]): void;
}

/**
 * 创建简单的事件中心
 *
 * @internal
 */
export function createEventBus(): EventBus {
    const all = new Map<keyof OrbitEvents, Handler[]>();

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
                handlers.splice(handlers.indexOf(handler as Handler) >>> 0, 1);
            }
        },
        emit(type, event) {
            const handlers = all.get(type);
            if (handlers) {
                handlers.slice().forEach((handler) => handler(event));
            }
        },
    };
}
