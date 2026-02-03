# @pathe/react

Pathe 的 React 集成。提供基于文件系统的路由生成，支持 React Router (v6+).

## 安装

```bash
pnpm add @pathe/react @pathe/core
```

## Vite 插件

在 `vite.config.ts` 中配置插件：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pathe from '@pathe/react/vite';

export default defineConfig({
    plugins: [
        react(),
        pathe({
            // 路由目录（相对于项目根目录）
            // 默认: 'app'
            dir: 'src/routes',
            
            // 忽略文件模式
            ignore: ['utils', '**/*.test.tsx'],
        }),
    ],
});
```

## 类型支持

为了让 TypeScript 识别虚拟模块 `virtual:pathe/routes`，请在 `src/vite-env.d.ts` 中添加引用：

```typescript
/// <reference types="@pathe/react/client" />
```

## 运行时使用

在你的应用入口（如 `main.tsx`）中使用生成的路由：

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from 'virtual:pathe/routes';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

## 文件约定

| 文件名 | 用途 |
| :--- | :--- |
| `page.tsx` | 页面组件 |
| `layout.tsx` | 布局组件 |
| `[id].tsx` | 动态路由 |
| `[...slug].tsx` | Catch-all 路由 |

## License

MIT
