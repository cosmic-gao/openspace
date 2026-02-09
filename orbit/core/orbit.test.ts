import { describe, it, expect, vi } from 'vitest';
import { Orbit } from './orbit';
import type { App } from './types';

describe('Orbit Kernel', () => {
    const mockApp: App = {
        name: 'test-app',
        entry: 'http://localhost:3000',
        container: '#app',
        activeRule: '/test',
    };

    it('should register apps correctly', () => {
        const orbit = new Orbit();
        const onRegistered = vi.fn();
        orbit.events.on('app:registered', onRegistered);

        orbit.registerApps([mockApp]);

        const app = orbit.getApp('test-app');
        expect(app).toBeDefined();
        expect(app?.status).toBe('NOT_LOADED');
        expect(onRegistered).toHaveBeenCalledWith(app);
    });

    it('should not register duplicate apps', () => {
        const orbit = new Orbit();
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        orbit.registerApps([mockApp]);
        orbit.registerApps([mockApp]);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already registered'));
        expect(orbit.getApps()).toHaveLength(1);

        consoleSpy.mockRestore();
    });

    it('should update app status and emit events', () => {
        const orbit = new Orbit({ apps: [mockApp] });
        const onStatusChange = vi.fn();
        orbit.events.on('app:status-change', onStatusChange);

        const app = orbit.getApp('test-app')!;
        orbit.setAppStatus(app, 'LOADING');

        expect(app.status).toBe('LOADING');
        expect(onStatusChange).toHaveBeenCalledWith({
            app,
            from: 'NOT_LOADED',
            to: 'LOADING',
        });
    });

    it('should handle errors and emit events', () => {
        const orbit = new Orbit({ apps: [mockApp] });
        const onError = vi.fn();
        orbit.events.on('error', onError);

        const app = orbit.getApp('test-app')!;
        const error = new Error('Load failed');

        orbit.handleError(app, error, 'LOAD_ERROR');

        expect(app.status).toBe('LOAD_ERROR');
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
            appName: 'test-app',
            message: 'Load failed',
            status: 'LOAD_ERROR'
        }));
    });

    it('should transition through lifecycle states', async () => {
        const orbit = new Orbit({ apps: [mockApp] });
        const app = orbit.getApp('test-app')!;

        // Load
        await orbit.loadApp('test-app');
        expect(app.status).toBe('NOT_BOOTSTRAPPED');

        // Mount (should trigger bootstrap)
        await orbit.mountApp('test-app');
        expect(app.status).toBe('MOUNTED');

        // Unmount
        await orbit.unmountApp('test-app');
        expect(app.status).toBe('NOT_MOUNTED');
    });

    it('should handle lifecycle errors', async () => {
        const orbit = new Orbit({ apps: [mockApp] });

        // Mock load error
        vi.spyOn(orbit, 'setAppStatus').mockImplementation((_app, status) => {
            if (status === 'LOADING') throw new Error('Mock load error');
            // Call original method or just simulate the state change logic if needed, 
            // but here we want to trigger the catch block in loadApp.
            // Actually `loadApp` calls `setAppStatus` then `events.emit`.
            // If `setAppStatus` throws, it goes to catch. 
        });

        await expect(orbit.loadApp('test-app')).rejects.toThrow('Mock load error');
    });
    it('should install plugins', () => {
        const orbit = new Orbit();
        const plugin = {
            name: 'test-plugin',
            install: vi.fn(),
        };

        orbit.use(plugin);

        expect(plugin.install).toHaveBeenCalledWith(orbit);
    });
});
