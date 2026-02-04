# @routing/vite

Routing 的 Vite 插件基础库。提供用于构建不同框架约定的 Vite 插件工厂函数。

通常你不需要直接安装这个包，除非你在开发新的框架适配器。应用开发者应该使用 `@routing/vue` 或 `@routing/react`。

## 安装

```bash
pnpm add @routing/vite
```

## 使用方法

### 创建自定义 Vite 插件

```typescript
import { define } from '@routing/vite';
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
    /** 
     * 路由目录，默认 'app' 
     * 建议使用绝对路径，或相对于 vite root 的路径
     */
    dir?: string;
    
    /** 
     * 忽略模式 
     * 支持通配符，如 ['components', '*.test.ts']
     */
    ignore?: string[];
}
```

### 开发体验（HMR）

`@routing/vite` 实现了智能的 HMR 策略：

- **增量更新**：仅当路由文件**新增** (`add`) 或**删除** (`unlink`) 时，才会触发路由表的重新生成。
- **局部热更**：路由表更新时，通过失效虚拟模块 (`invalidateModule`) 触发热更新，而非强制刷新整个页面 (Full Reload)。这意味着在编辑组件代码时，你可以保持应用状态。


## License

MIT
