## 目标
- 不新增包：在 `@openspace/pathe` 内新增 `adapter/` 目录，提供 vue-router、react-router 的 route object 生成器。
- 框架依赖作为“可选项”：不要求安装也能使用 `@openspace/pathe` 的 core/node；只有使用对应 adapter 时才需要（或可选）安装框架依赖。

## 目录与导出
- 新增目录：`packages/pathe/adapter/`
  - `adapter/index.ts`：统一导出所有 adapter 与公共类型
  - `adapter/normalized.ts`：框架无关的归一化 IR（NormalizedRouteNode 等）
  - `adapter/normalize.ts`：`RouteTree -> IR` 的转换（复用现有 `Segment`/`RouteNode`）
  - `adapter/vue-router.ts`：Vue Router 适配器
  - `adapter/react-router.ts`：React Router 适配器
- 修改 `packages/pathe/index.ts`：增加 `export * from './adapter'`（保持向后兼容）。

## 依赖策略（package.json）
- `packages/pathe/package.json`：
  - 增加 `peerDependencies`：`vue-router`、`react-router`、`react-router-dom`
  - 用 `peerDependenciesMeta` 标记为 optional（避免未安装时报错安装失败）
  - 若 adapter 需要类型检查/单测里用到框架类型，则同时加到 `devDependencies`；若 adapter 输出“结构兼容类型”，可不加 devDeps。

## 适配器协议（公共 API）
- 定义：
  - `RouteAdapter<T>`：`adapt(tree, options) => T`
  - `ComponentResolver`：由用户注入把 `components.page/layout/...` 转为框架 component/element/lazy
  - `MetaMapper`：把 `middleware/meta-files/segment 信息` 注入到 `meta/handle`
  - `PathStrategy`：定义 pathe pattern（`:name+`/`:name*`）到目标框架 path 语法的映射
- 约束：adapter 不在运行时 import 框架包；仅输出 route objects（保证“可选依赖”成立）。

## 关键映射规则（写死 + 可配置）
- 基础段：static→`segment.raw`，dynamic→`:name`
- catchAll（pathe `:name+`）：
  - vue-router：默认 `:name(.*)+`
  - react-router：默认 `*`（并在 `handle/meta` 保留原 paramName 便于上层消费）
- optionalCatchAll（pathe `:name*`）：
  - vue-router：默认 `/:name(.*)*`（含斜杠可选）
  - react-router：默认 `*`（同上保留 paramName）
- layout/page：
  - layout 作为父 route；page 作为当前 route 的 component/element
  - 根目录 page 作为 index route（react）或 path: '' child（vue）
- group 段不进入 URL；parallel/intercepts 默认不映射为 URL（写入 meta，交给调用方策略扩展）。

## 测试与验证
- 新增 `adapter/*.test.ts`（vitest）：
  - static/dynamic/catchAll/optionalCatchAll 的 path 映射正确
  - layout 嵌套结构正确
  - group 段被忽略
  - middleware/meta 注入到 meta/handle
- 跑全量 `packages/pathe` 测试，确保 0 回归。

## 交付物
- `@openspace/pathe/adapter` 新增完整适配层 + 单测 + 文档片段（README 增加使用示例）。