# @pathe/vite

Pathe 的 Vite 插件基础库。提供用于构建不同框架约定的 Vite 插件工厂函数。

通常你不需要直接安装这个包，除非你在开发新的框架适配器。应用开发者应该使用 `@pathe/vue` 或 `@pathe/react`。

## 安装

```bash
pnpm add @pathe/vite
```

## 使用方法

### 创建自定义 Vite 插件

```typescript
import { define } from '@pathe/vite';
import { adapt } from './my-adapter'; // 你的自定义适配器

export const myPlugin = define('my-framework', {
    id: 'virtual:my-routes', // 虚拟模块 ID
    generate: (tree) => {
        const code = adapt(tree); // 将路由树转换为代码
        return `export default ${JSON.stringify(code)};`;
    },
});
```

### 插件选项

所有基于 `define` 创建的插件都接受以下基本选项：

```typescript
interface Options {
    /** 路由目录，默认 'app' */
    dir?: string;
    /** 忽略模式 */
    ignore?: string[];
}
```

## License

MIT
