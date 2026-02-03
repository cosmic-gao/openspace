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

| 文件名 | 用途 |
| :--- | :--- |
| `page.vue` | 页面组件 |
| `layout.vue` | 布局组件 |
| `[id].vue` | 动态路由 |
| `[...slug].vue` | Catch-all 路由 |

## License

MIT
