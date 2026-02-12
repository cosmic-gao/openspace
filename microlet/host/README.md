# @orbit/host

**宿主应用适配器。**

`@orbit/host` 提供宿主侧的微前端适配规则，将 `@orbit/core` 的协议适配到具体的微前端框架。

## 安装

```bash
pnpm add @orbit/host
```

## 使用

```typescript
import { adapt } from '@orbit/host';

// 加载子应用
const lifecycle = await adapt(
    {
        name: 'sub-app',
        entry: 'http://localhost:3001',
        container: '#sub-app',
    },
    { prefetch: true, keepAlive: true }
);
```

## API

### `adapt(ctx, options)`

加载并适配子应用。

**参数**：

- `ctx.name`: 应用名称
- `ctx.entry`: 应用入口地址
- `ctx.container`: 挂载容器
- `options.prefetch`: 预加载策略
- `options.keepAlive`: 保持存活

**返回值**：`Promise<HostResult>`

## License

MIT
