/**
 * 宿主检测
 *
 * 检测当前运行环境的宿主类型
 */

/**
 * 宿主类型
 */
export type HostType = 'qiankun' | 'wujie' | 'micro-app' | 'standalone';

/**
 * 扩展 Window 接口
 */
interface MicroFrontendWindow extends Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __POWERED_BY_WUJIE__?: boolean;
    __MICRO_APP_ENVIRONMENT__?: boolean;
}

/**
 * 检测当前宿主类型
 *
 * @returns 宿主类型
 *
 * @example
 * ```typescript
 * import { detect } from '@orbit/sub';
 *
 * const host = detect();
 * if (host === 'qiankun') {
 *     // qiankun 环境
 * }
 * ```
 */
export function detect(): HostType {
    if (typeof window !== 'undefined') {
        const w = window as MicroFrontendWindow;
        if (w.__POWERED_BY_QIANKUN__) return 'qiankun';
        if (w.__POWERED_BY_WUJIE__) return 'wujie';
        if (w.__MICRO_APP_ENVIRONMENT__) return 'micro-app';
    }
    return 'standalone';
}
