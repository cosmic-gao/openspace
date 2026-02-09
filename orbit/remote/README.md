# @orbit/remote

**子应用适配器。**

`@orbit/remote` 提供子应用侧的统一入口适配层，屏蔽不同宿主框架的差异。

## 安装

```bash
pnpm add @orbit/remote
```

## 使用

```typescript
import { register, detect, defineSub } from '@orbit/remote';

// 注册宿主检测器
register(() => !!window.__POWERED_BY_QIANKUN__);
register(() => !!window.__POWERED_BY_WUJIE__);

// 检测宿主环境
const host = detect();
console.log('当前宿主:', host); // 'host' | 'standalone'

// 定义子应用
export const lifecycle = defineSub({
    name: 'my-app',
    mount: (container, props) => {
        // 挂载应用
        app.mount(container);
    },
    unmount: () => {
        // 卸载应用
        app.unmount();
    },
});
```

## API

### `register(detector)`

注册宿主检测器。

**参数**：

- `detector`: `() => boolean` - 检测函数，返回 `true` 表示在宿主环境中

**示例**：

```typescript
// 注册自定义检测器
register(() => !!window.MY_CUSTOM_HOST);
```

### `detect()`

检测当前宿主类型。

**返回值**：`HostType`

- `'host'`: 在宿主容器中运行
- `'standalone'`: 独立运行

### `defineSub(options)`

定义子应用。

**参数**：

- `options.name`: 应用名称
- `options.mount`: 挂载函数
- `options.unmount`: 卸载函数
- `options.update`: 更新函数（可选）

**返回值**：`Lifecycle`

## License

MIT
