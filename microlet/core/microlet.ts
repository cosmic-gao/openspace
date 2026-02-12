/**
 * Microlet 核心类
 */
import { createEventBus, type EventBus } from './events';
import type { App, AppError, AppStatus, RegisteredApp } from './types';
import type { MicroletPlugin } from './adapter';

/**
 * Microlet 配置
 */
export interface MicroletOptions {
    /** 初始应用列表 */
    apps?: App[];
}

/**
 * Microlet 实例
 */
export class Microlet {
    /** 事件中心 */
    public readonly events: EventBus = createEventBus();

    /** 应用注册表 */
    private readonly apps = new Map<string, RegisteredApp>();

    constructor(options: MicroletOptions = {}) {
        if (options.apps) {
            this.registerApps(options.apps);
        }
    }

    /**
     * 注册应用
     *
     * @param apps - 应用列表
     *
     * @example
     * ```typescript
     * microlet.registerApps([
     *   { name: 'app1', entry: '//localhost:3000', container: '#app' }
     * ]);
     * ```
     */
    public registerApps(apps: App[]): void {
        apps.forEach(app => {
            if (this.apps.has(app.name)) {
                console.warn(`[Microlet] App "${app.name}" is already registered.`);
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
     *
     * @param name - 应用名称
     * @returns 已注册的应用或 undefined
     *
     * @example
     * ```typescript
     * const app = microlet.getApp('app1');
     * ```
     */
    public getApp(name: string): RegisteredApp | undefined {
        return this.apps.get(name);
    }

    /**
     * 获取所有应用
     *
     * @returns 所有已注册应用的列表
     */
    public getApps(): RegisteredApp[] {
        return Array.from(this.apps.values());
    }

    /**
     * 更新应用状态
     *
     * @param app - 应用实例
     * @param status - 新状态
     *
     * @internal
     */
    public setAppStatus(app: RegisteredApp, status: AppStatus): void {
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
     *
     * @param app - 应用实例
     * @param error - 错误对象
     * @param status - 错误状态
     *
     * @internal
     */
    public handleError(app: RegisteredApp, error: Error, status: AppStatus): void {
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
     *
     * @param plugin - 插件实例
     * @returns Microlet 实例
     *
     * @example
     * ```typescript
     * microlet.use(plugin);
     * ```
     */
    public use(plugin: MicroletPlugin): this {
        console.log(`[Microlet] Installing plugin "${plugin.name}"`);
        plugin.install(this);
        return this;
    }

    /**
     * 加载应用
     *
     * @param name - 应用名称
     * @throws 如果应用未找到或加载失败
     */
    public async loadApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) {
            throw new Error(`[Microlet] App "${name}" not found.`);
        }

        if (app.status !== 'NOT_LOADED' && app.status !== 'LOAD_ERROR') {
            return;
        }

        this.setAppStatus(app, 'LOADING');
        this.events.emit('app:before-load', app);

        try {
            await this._performLoad(app);
            app.loadTime = Date.now();
            this.setAppStatus(app, 'NOT_BOOTSTRAPPED');
            this.events.emit('app:loaded', app);
        } catch (e) {
            this.handleError(app, e as Error, 'LOAD_ERROR');
            throw e;
        }
    }

    /**
     * 执行实际加载逻辑
     * @private
     */
    private async _performLoad(_app: RegisteredApp): Promise<void> {
        // TODO: 调用 Adapter 加载资源
        // 模拟加载
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    /**
     * 初始化应用
     *
     * @param name - 应用名称
     * @throws 如果应用未找到或初始化失败
     */
    public async bootstrapApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Microlet] App "${name}" not found.`);

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
     *
     * @param name - 应用名称
     * @throws 如果应用未找到或挂载失败
     */
    public async mountApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Microlet] App "${name}" not found.`);

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
     *
     * @param name - 应用名称
     * @throws 如果应用未找到或卸载失败
     */
    public async unmountApp(name: string): Promise<void> {
        const app = this.getApp(name);
        if (!app) throw new Error(`[Microlet] App "${name}" not found.`);

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
 * 创建 Microlet 实例
 *
 * @param options - 配置选项
 * @returns Microlet 实例
 */
export function createMicrolet(options?: MicroletOptions): Microlet {
    return new Microlet(options);
}
