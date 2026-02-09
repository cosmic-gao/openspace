/**
 * 宿主检测
 *
 * 检测当前运行环境的宿主类型
 */

/**
 * 宿主类型
 *
 * - `host`: 作为子应用运行在宿主容器中
 * - `standalone`: 独立运行
 */
export type HostType = 'host' | 'standalone';

/**
 * 宿主检测器
 *
 * @returns 是否在宿主环境中运行
 */
export type Detector = () => boolean;

/**
 * 已注册的检测器列表
 */
const detectors: Detector[] = [];

/**
 * 注册宿主检测器
 *
 * @param detector - 检测器函数
 *
 * @example
 * ```typescript
 * import { register } from '@orbit/remote';
 *
 * // 注册自定义检测器
 * register(() => !!window.MY_CUSTOM_HOST);
 * ```
 */
export function register(detector: Detector): void {
    detectors.push(detector);
}

/**
 * 清除所有检测器
 *
 * @internal 仅用于测试/重置
 */
export function clearDetectors(): void {
    detectors.length = 0;
}

/**
 * 检测当前宿主类型
 *
 * @returns 宿主类型
 *
 * @example
 * ```typescript
 * import { detect } from '@orbit/remote';
 *
 * const host = detect();
 * if (host === 'host') {
 *     // 在宿主容器中运行
 * }
 * ```
 */
export function detect(): HostType {
    for (const detector of detectors) {
        if (detector()) return 'host';
    }
    return 'standalone';
}
