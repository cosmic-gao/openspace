/**
 * 事件总线
 *
 * 提供应用间通信能力
 */

/**
 * 事件处理函数
 */
export type EventHandler<T = unknown> = (payload: T) => void;

/**
 * 事件总线接口
 */
export interface Bus {
    /**
     * 订阅事件
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    on<T = unknown>(event: string, handler: EventHandler<T>): void;

    /**
     * 取消订阅
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    off<T = unknown>(event: string, handler: EventHandler<T>): void;

    /**
     * 发布事件
     * @param event 事件名称
     * @param payload 事件负载
     */
    emit<T = unknown>(event: string, payload?: T): void;

    /**
     * 单次订阅
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    once<T = unknown>(event: string, handler: EventHandler<T>): void;
}
