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

Pathe 自动扫描目标目录下的 `.tsx` / `.jsx` 文件生成路由。

| 文件名 | 对应路由 | 备注 |
| :--- | :--- | :--- |
| `index.tsx` | `/` | 默认首页 (index: true) |
| `about.tsx` | `/about` | 静态路径 |
| `users/[id].tsx` | `/users/:id` | 动态参数 |
| `[...all].tsx` | `/*` | Catch-all 路由 |
| `_layout.tsx` | - | 父级布局组件 |

### 懒加载 (React.lazy)

生成的路由配置自动使用 `React.lazy` 包装组件导入。确保在应用根部包裹 `<React.Suspense>` 以处理加载状态。

```tsx
<Suspense fallback={<Loading />}>
  <RouterProvider router={router} />
</Suspense>
```


## License

MIT
