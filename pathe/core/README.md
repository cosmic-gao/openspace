# @pathe/core

**The FileSystem Routing Meta-Model.**

Pathe 是一个现代的、类型安全的文件系统路由库。它并不绑定于某一特定的 UI 框架，而是提供了一套通用的“元模型”（Meta-Model），用于扫描文件系统、解析路由结构，并适配到任意目标框架。

`@pathe/core` 是整个体系的核心，提供了底层的扫描器、解析器和工具函数。

## 特性

- ⚡ **框架无关**：同时提供 Vue 与 React 的官方支持，易于扩展其他框架。
- 🛠 **高度可控**：提供底层的 Scanner、Parser 和 Adapter API，满足复杂场景的定制需求。
- 🚀 **Vite 集成**：深度集成的 Vite 插件，支持**增量 HMR**（仅在文件增删时触发更新），提供极佳的开发体验。
- 🔒 **类型安全**：全链路 TypeScript 支持，包括生成的虚拟模块定义。

## 快速开始

如果你正在使用以下框架，建议直接查看对应的集成包：

- **Vue**: 查看 [@pathe/vue](../vue/README.md)
- **React**: 查看 [@pathe/react](../react/README.md)

## 安装核心包

如果你需要基于 Pathe 开发特定框架的适配器，或者在非 Vite 环境（如纯 Node.js 脚本）中使用：

```bash
pnpm add @pathe/core
```

## 使用核心功能

### 1. 扫描文件系统 (Node.js)

```typescript
import { createScanner } from "@pathe/core";

const scanner = createScanner({
    // 忽略特定目录
    ignore: ['components', 'utils', '*.test.ts'],
});

// 扫描目录生成路由树
const tree = await scanner.scan("./app/routes");
console.log(tree);
```

### 2. 解析路由段

```typescript
import { createParser } from "@pathe/core";

const parser = createParser();

parser.parse("blog");        // -> { type: 'static', name: 'blog', ... }
parser.parse("[id]");        // -> { type: 'dynamic', name: 'id', ... }
parser.parse("[...slug]");   // -> { type: 'catchAll', name: 'slug', ... }
```

### 3. 生成路径

```typescript
import { generatePath } from "@pathe/core";

const path = generatePath("/posts/:id/comments/:cid", { 
    id: "123", 
    cid: "456" 
}); 
// => "/posts/123/comments/456"
```

## 架构说明

Pathe 采用 Monorepo 结构，各包职责如下：

| 包名 | 说明 |
| :--- | :--- |
| **`@pathe/core`** | 核心逻辑库。包含 Scanner, Parser, Matcher 等通用逻辑。 |
| **`@pathe/vite`** | Vite 插件工厂。提供通用的 HMR 逻辑和虚拟模块构建能力。 |
| **`@pathe/vue`** | Vue 专用适配器。将路由树转换为 Vue Router 配置。 |
| **`@pathe/react`** | React 专用适配器。将路由树转换为 React Router (v6) 配置。 |

## API 概览

### Main Exports

- `createScanner(options)`: 创建文件系统扫描器
- `createParser()`: 创建路径段解析器
- `createBuilder()`: 创建路由构建器
- `createMatcher()`: 创建 URL 匹配器
- `createValidator()`: 创建路由验证器
- `generatePath(pattern, params)`: 路径生成工具
- `serialize(tree)` / `deserialize(json)`: 序列化工具

### Subpath Exports

- `@pathe/core/adapter`: 适配器类型定义（供 Adapter 开发者使用）
- `@pathe/core/types`: 核心类型定义

## License

MIT
