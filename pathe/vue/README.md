# @pathe/vue

Pathe 的 Vue 集成。提供基于文件系统的路由生成，支持 Vue Router。

## 安装

```bash
pnpm add @pathe/vue @pathe/core
```

## Vite 插件

在 `vite.config.ts` 中配置插件：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pathe from '@pathe/vue/vite';

export default defineConfig({
    plugins: [
        vue(),
        pathe({
            // 路由目录（相对于项目根目录）
            // 默认: 'app'
            dir: 'src/pages',
            
            // 忽略文件模式
            ignore: ['components', '**/*.test.ts'],
        }),
    ],
});
```

## 类型支持

为了让 TypeScript 识别虚拟模块 `virtual:pathe/routes`，请在 `src/vite-env.d.ts` 中添加引用：

```typescript
/// <reference types="@pathe/vue/client" />
```

## 运行时使用

在你的应用入口（如 `main.ts`）中使用生成的路由：

```typescript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import routes from 'virtual:pathe/routes';
import App from './App.vue';

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount('#app');
```

## 文件约定

Pathe 自动扫描目标目录下的 `.vue` 文件生成路由。

| 文件名 | 对应路由 | 备注 |
| :--- | :--- | :--- |
| `index.vue` | `/` | 默认首页 |
| `about.vue` | `/about` | 静态路径 |
| `users/[id].vue` | `/users/:id` | 动态参数 |
| `[...all].vue` | `/:all(.*)*` | Catch-all 路由 |
| `_layout.vue` | - | 父级布局组件 |

### 懒加载

所有生成的路由组件均通过动态导入 (`() => import(...)`) 实现懒加载，不仅优化了首屏体积，也避免了开发时的循环依赖问题。


## License

MIT
