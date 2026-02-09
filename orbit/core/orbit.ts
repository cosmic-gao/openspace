/**
 * Orbit 核心类
 */
import { createEventBus, type EventBus } from './events';
import type { App, AppError, AppStatus, RegisteredApp } from './types';
import type { OrbitPlugin } from './adapter';

/**
 * Orbit 配置
 */
export interface OrbitOptions {
    /** 初始应用列表 */
    apps?: App[];
}

/**
 * Orbit 实例
 */
export class Orbit {
    /** 事件中心 */
    public readonly events: EventBus = createEventBus();

    /** 应用注册表 */
    private readonly apps = new Map<string, RegisteredApp>();

    constructor(options: OrbitOptions = {}) {
        if (options.apps) {
            this.registerApps(options.apps);
        }
    }

    /**
     * 注册应用
     */
    public registerApps(apps: App[]) {
        apps.forEach(app => {
            if (this.apps.has(app.name)) {
                console.warn(`[Orbit] App "${app.name}" is already registered.`);
                return;
            }

            const registeredApp: RegisteredApp = {
                ...app,
                status: 'NOT_LOADED',
            };

            this.apps.set(app.name, registeredApp);
            this.events.emit('app:registered', registeredApp);
        });
    }

    /**
     * 获取应用
     */
    public getApp(name: string): RegisteredApp | undefined {
        return this.apps.get(name);
    }

    /**
     * 获取所有应用
     */
    public getApps(): RegisteredApp[] {
        return Array.from(this.apps.values());
    }

    /**
     * 更新应用状态
     * @internal
     */
    public setAppStatus(app: RegisteredApp, status: AppStatus) {
        if (app.status === status) return;

        const from = app.status;
        app.status = status;

        this.events.emit('app:status-change', {
            app,
            from,
            to: status,
        });
    }

    /**
     * 处理错误
     * @internal
     */
    public handleError(app: RegisteredApp, error: Error, status: AppStatus) {
        const appError: AppError = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            appName: app.name,
            status
        };

        this.setAppStatus(app, status);
        this.events.emit('error', appError);
    }
    /**
     * 安装插件
     */
    public use(plugin: OrbitPlugin) {
        console.log(`[Orbit] Installing plugin "${plugin.name}"`);
        plugin.install(this);
        return this;
    }

    /**
     * 加载应用
     */
    public async loadApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) {
            throw new Error(`[Orbit] App "${name}" not found.`);
        }

        if (app.status !== 'NOT_LOADED' && app.status !== 'LOAD_ERROR') {
            return;
        }

        this.setAppStatus(app, 'LOADING');
        this.events.emit('app:before-load', app);

        try {
            // TODO: 调用 Adapter 加载资源
            // const lifecycle = await this.adapter.load(app);
            // app.lifecycle = lifecycle;

            // 模拟加载
            await new Promise(resolve => setTimeout(resolve, 0));

            app.loadTime = Date.now();
            this.setAppStatus(app, 'NOT_BOOTSTRAPPED');
            this.events.emit('app:loaded', app);
        } catch (e) {
            this.handleError(app, e as Error, 'LOAD_ERROR');
            throw e;
        }
    }

    /**
     * 初始化应用
     */
    public async bootstrapApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Orbit] App "${name}" not found.`);

        if (app.status !== 'NOT_BOOTSTRAPPED') {
            if (app.status === 'NOT_LOADED') {
                await this.loadApp(name);
            } else {
                return;
            }
        }

        this.setAppStatus(app, 'BOOTSTRAPPING');

        try {
            // await app.lifecycle?.bootstrap?.(app);
            this.setAppStatus(app, 'NOT_MOUNTED');
        } catch (e) {
            this.handleError(app, e as Error, 'BOOTSTRAP_ERROR');
            throw e;
        }
    }

    /**
     * 挂载应用
     */
    public async mountApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Orbit] App "${name}" not found.`);

        if (app.status !== 'NOT_MOUNTED') {
            await this.bootstrapApp(name);
        }

        this.setAppStatus(app, 'MOUNTING');
        this.events.emit('app:before-mount', app);

        try {
            // await app.lifecycle?.mount?.(app, props);
            this.setAppStatus(app, 'MOUNTED');
            this.events.emit('app:mounted', app);
        } catch (e) {
            this.handleError(app, e as Error, 'MOUNT_ERROR');
            throw e;
        }
    }

    /**
     * 卸载应用
     */
    public async unmountApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Orbit] App "${name}" not found.`);

        if (app.status !== 'MOUNTED') return;

        this.setAppStatus(app, 'UNMOUNTING');
        this.events.emit('app:before-unmount', app);

        try {
            // await app.lifecycle?.unmount?.(app);
            this.setAppStatus(app, 'NOT_MOUNTED');
            this.events.emit('app:unmounted', app);
        } catch (e) {
            this.handleError(app, e as Error, 'UNMOUNT_ERROR');
            throw e;
        }
    }
}

/**
 * 创建 Orbit 实例
 */
export function createOrbit(options?: OrbitOptions): Orbit {
    return new Orbit(options);
}
