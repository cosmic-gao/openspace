# @orbit/core

**The Micro-Frontend Meta-Protocol.**

Orbit 是一个现代的、框架无关的微前端协议库。它不绑定于特定的微前端框架（如 qiankun、wujie），而是提供一套通用的"元协议"（Meta-Protocol），用于定义应用生命周期、调度机制和适配接口。

`@orbit/core` 是整个体系的核心，提供底层的调度器、注册表、事件总线和适配器工厂。

## 特性

- ⚡ **框架无关**：同时支持 qiankun、wujie、micro-app 等微前端框架
- 🛠 **高度可控**：提供底层的 Scheduler、Registry、Bus API，满足复杂场景定制
- 🔌 **可插拔适配**：通过 `define()` 工厂函数创建自定义适配器
- 🔒 **类型安全**：全链路 TypeScript 支持

## 快速开始

如果你正在使用以下场景，建议查看对应的集成包：

- **宿主应用**: 查看 [@orbit/host](../host/README.md)
- **子应用**: 查看 [@orbit/remote](../remote/README.md)

## 安装核心包

```bash
pnpm add @orbit/core
```

## 使用核心功能

### 1. 定义适配器

```typescript
import { define } from '@orbit/core';

const adapt = define<Lifecycle, Options>({
    load: async (ctx) => fetch(ctx.entry),
    lifecycle: (ctx, opts, loaded) => ({
        mount: async () => { /* 挂载逻辑 */ },
        unmount: async () => { /* 卸载逻辑 */ },
    }),
});
```

### 2. 使用注册表

```typescript
import type { Registry } from '@orbit/core';

// 注册应用
registry.register({
    name: 'sub-app',
    entry: 'http://localhost:3001',
    container: '#sub-app',
    activeRule: '/sub',
});

// 获取应用
const app = registry.get('sub-app');
```

### 3. 使用事件总线

```typescript
import type { Bus } from '@orbit/core';

// 订阅事件
bus.on('app:mounted', (payload) => {
    console.log('应用已挂载:', payload);
});

// 发布事件
bus.emit('app:mounted', { name: 'sub-app' });
```

## 架构说明

Orbit 采用 Monorepo 结构，各包职责如下：

| 包名 | 说明 |
| :--- | :--- |
| **`@orbit/core`** | 核心协议库。包含 Scheduler、Registry、Bus 等通用逻辑。 |
| **`@orbit/host`** | 宿主适配器。将协议适配到具体微前端框架。 |
| **`@orbit/remote`** | 子应用适配器。提供统一的子应用入口。 |

## API 概览

### Main Exports

- `define(definition)`: 定义适配器工厂函数
- `Scheduler`: 应用调度器接口
- `Registry`: 应用注册表接口
- `Bus`: 事件总线接口

### Subpath Exports

- `@orbit/core/adapter`: 适配器类型定义
- `@orbit/core/types`: 核心类型定义

## License

MIT
