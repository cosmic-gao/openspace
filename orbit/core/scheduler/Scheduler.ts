/**
 * 应用调度器接口
 *
 * 负责监听路由变化并触发应用生命周期
 */

/**
 * 调度器配置
 */
export interface SchedulerOptions {
    /** 路由模式 */
    mode?: 'hash' | 'history';
}

/**
 * 调度器接口
 */
export interface Scheduler {
    /** 启动调度器 */
    start(): void;
    /** 停止调度器 */
    stop(): void;
    /** 触发重新路由 */
    reroute(): Promise<void>;
}

/**
 * 调度事件
 */
export type SchedulerEvent =
    | 'beforeReroute'
    | 'afterReroute'
    | 'noMatch';
