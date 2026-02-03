# @pathe/core

基于文件系统的路由元模型库，提供跨平台的路由扫描、解析与生成能力。

## 特性

- **类型安全** - 完整的 TypeScript 类型定义
- **框架无关** - 核心逻辑独立，支持 Vue/React 等任意框架
- **高度可定制** - 支持自定义文件约定、解析规则和路由生成
- **Vite 集成** - 提供开箱即用的 Vite 插件，支持 HMR

## 核心包

### Client Types

在 `vite-env.d.ts` 中添加引用以获得 `virtual:pathe/routes` 类型支持：

Vue:
```typescript
/// <reference types="@pathe/vue/client" />
```

React:
```typescript
/// <reference types="@pathe/react/client" />
```

### 安装

```bash
pnpm add @pathe/core
```

### 使用核心功能

```typescript
import { createScanner, createParser, generatePath } from "@pathe/core";

// 1. 扫描文件系统 (Node.js)
const scanner = createScanner({
    ignore: ['components', 'utils'],
});
const tree = await scanner.scan("./app/routes");

// 2. 解析路由段
const parser = createParser();
const segment = parser.parse("[...slug]"); 
// => { type: 'catchAll', name: 'slug', raw: '[...slug]' }

// 3. 生成路径
const path = generatePath("/blog/:id", { id: "123" });
// => "/blog/123"
```

## 框架集成

Pathe 提供了针对主流框架的独立集成包。

### Vue

详见 [@pathe/vue](../vue/README.md)

### React

详见 [@pathe/react](../react/README.md)

## 架构说明

目录结构如下：

- **`@pathe/core`**: 核心库，包含 Parser, Scanner, Matcher 等通用逻辑。
- **`@pathe/core/adapter`**: 适配器基类定义，用于开发自定义框架适配器。
- **`@pathe/vite`**: Vite 插件基类定义。
- **`@pathe/vue`**: Vue 专用适配器与 Vite 插件。
- **`@pathe/react`**: React 专用适配器与 Vite 插件。

## API 概览

### `@pathe/core` (Main)

- `createScanner(options)`: 创建文件系统扫描器
- `createParser()`: 创建路径段解析器
- `createBuilder()`: 创建路由构建器
- `createMatcher()`: 创建 URL 匹配器
- `createValidator()`: 创建路由验证器
- `generatePath(pattern, params)`: 路径生成工具
- `serialize(tree)` / `deserialize(json)`: 序列化工具

### 子包与导出

- `@pathe/core/adapter`: 适配器类型定义
- `@pathe/vite`: Vite 插件工厂函数 (`define`)


## License

MIT
