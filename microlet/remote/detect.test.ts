import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detect, register, clearDetectors, type Detector } from './detect';

describe('detect', () => {
    // 保存原始 detectors 状态
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        originalWindow = globalThis.window;
        clearDetectors();
    });

    afterEach(() => {
        globalThis.window = originalWindow;
        clearDetectors();
    });

    it('should return "standalone" when no detector registered', () => {
        const result = detect();
        expect(result).toBe('standalone');
    });

    it('should return "host" when detector returns true', () => {
        const mockDetector: Detector = () => true;
        register(mockDetector);

        const result = detect();
        expect(result).toBe('host');
    });

    it('should return "standalone" when all detectors return false', () => {
        const mockDetector: Detector = () => false;
        register(mockDetector);

        const result = detect();
        expect(result).toBe('standalone');
    });

    it('should support custom host detection', () => {
        // @ts-expect-error - 模拟自定义宿主环境
        globalThis.window = { MY_CUSTOM_HOST: true };

        register(() => !!(window as unknown as { MY_CUSTOM_HOST?: boolean }).MY_CUSTOM_HOST);

        const result = detect();
        expect(result).toBe('host');
    });
});
