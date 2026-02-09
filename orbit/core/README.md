# @orbit/core

**The Micro-Frontend Meta-Protocol.**

Orbit 是一个现代的、框架无关的微前端协议库。它不绑定于特定的微前端框架（如 qiankun、wujie），而是提供一套通用的"元协议"（Meta-Protocol），用于定义应用生命周期、调度机制和适配接口。

`@orbit/core` 是整个体系的核心，提供底层的调度器、注册表、事件总线和插件机制。

## 特性

- ⚡ **框架无关**：核心层不依赖任何特定框架实现
- 🔄 **统一生命周期**：基于 `AppStatus` 的状态机管理，单一事实源
- 🔌 **插件化架构**：通过 `Adapter` 和 `OrbitPlugin` 扩展加载器、沙箱等能力
- 🛡 **稳健可靠**：完善的错误处理与事件机制
- 🔒 **类型安全**：全链路 TypeScript 支持

## 快速开始

### 安装

```bash
pnpm add @orbit/core
```

### 基础使用

```typescript
import { createOrbit } from '@orbit/core';

// 1. 创建 Orbit 实例
const orbit = createOrbit({
    apps: [
        {
            name: 'app-1',
            entry: '//localhost:3001',
            container: '#sub-app',
            activeRule: '/app1',
        }
    ]
});

// 2. 监听事件
orbit.events.on('app:mounted', (app) => {
    console.log(`App ${app.name} mounted`);
});

orbit.events.on('error', (err) => {
    console.error(`Error in ${err.appName} at ${err.status}:`, err);
});

// 3. 扩展能力 (使用插件)
// orbit.use(myPlugin);

// 4. 手动调度 (可选)
// await orbit.mountApp('app-1');
```

## 核心概念

### AppStatus

应用状态是系统的核心事实源：

- `NOT_LOADED`
- `LOADING` / `loaded`
- `NOT_BOOTSTRAPPED`
- `BOOTSTRAPPING`
- `NOT_MOUNTED`
- `MOUNTING` / `MOUNTED`
- `UNMOUNTING`
- `LOAD_ERROR` / `BOOTSTRAP_ERROR` / `MOUNT_ERROR` / `UNMOUNT_ERROR`

### 插件机制

通过插件扩展加载器（Loader）和沙箱（Sandbox）能力：

```typescript
import type { OrbitPlugin } from '@orbit/core';

const myPlugin: OrbitPlugin = {
    name: 'my-plugin',
    install(orbit) {
        // 扩展 orbit 功能
    }
};

orbit.use(myPlugin);
```

## API

### `createOrbit(options)`

创建 Orbit 内核实例。

### `Orbit` 实例

- `registerApps(apps)`: 注册应用
- `loadApp(name)`: 加载应用
- `mountApp(name)`: 挂载应用
- `unmountApp(name)`: 卸载应用
- `use(plugin)`: 安装插件
- `events`: 事件中心

### Events

- `app:registered`
- `app:status-change`
- `app:before-load` / `app:loaded`
- `app:before-mount` / `app:mounted`
- `app:before-unmount` / `app:unmounted`
- `error`

## License

MIT
