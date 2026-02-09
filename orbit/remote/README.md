# @orbit/remote

**子应用适配器。**

`@orbit/remote` 提供子应用侧的统一入口适配层，屏蔽不同宿主框架的差异。

## 安装

```bash
pnpm add @orbit/remote
```

## 使用

```typescript
import { defineSub, detect } from '@orbit/remote';

// 检测宿主环境
const host = detect();
console.log('当前宿主:', host); // 'qiankun' | 'wujie' | 'micro-app' | 'standalone'

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

### `detect()`

检测当前宿主类型。

**返回值**：`HostType`

- `'qiankun'`: qiankun 环境
- `'wujie'`: wujie 环境
- `'micro-app'`: micro-app 环境
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
