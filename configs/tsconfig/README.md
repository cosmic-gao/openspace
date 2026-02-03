# @openspace/tsconfig

可复用的 TypeScript 配置集合，基于 TypeScript 5.x 最佳实践。

## 配置列表

| 配置     | 用途                          |
| -------- | ----------------------------- |
| `base`   | 基础配置（严格模式 + ESNext） |
| `lib`    | 库包配置（声明文件生成）      |
| `esm`    | ESM 模块配置                  |
| `node`   | Node.js 应用                  |
| `web`    | 浏览器/DOM 应用               |
| `vite`   | Vite 应用                     |
| `vue`    | Vue 3 应用                    |
| `react`  | React 应用                    |
| `next`   | Next.js 应用                  |
| `vitest` | Vitest 测试                   |

## 使用

```json
{
    "extends": "@openspace/tsconfig/lib"
}
```

## 继承关系

```
base.json
├── lib.json
├── esm.json
├── node.json
└── web.json
    ├── vite.json
    │   └── vitest.json
    ├── vue.json
    └── react.json
        └── next.json
```
