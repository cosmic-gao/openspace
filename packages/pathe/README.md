# @openspace/pathe

基于文件系统的路由元模型库。

## 特性

- **类型安全** - 完整的 TypeScript 类型定义
- **可扩展** - 预设组合 + 自定义文件类型
- **跨平台** - 核心逻辑与运行时分离
- **零依赖** - 无第三方运行时依赖

## 安装

```bash
pnpm add @openspace/pathe
```

## 快速开始

### 扫描路由树

```typescript
import { createScanner } from "@openspace/pathe";

const scanner = createScanner({
    // 忽略特定目录
    ignore: ['node_modules', '.*', '__tests__'],
    // 限制并发扫描数
    concurrency: 10,
});
const tree = await scanner.scan("./app");

console.log(tree);
```

### 解析路由段

```typescript
import { createParser } from "@openspace/pathe";

const parser = createParser();

parser.parse("blog"); // { raw: 'blog', type: 'static' }
parser.parse("[id]"); // { raw: '[id]', type: 'dynamic', name: 'id' }
parser.parse("[...slug]"); // { raw: '[...slug]', type: 'catchAll', name: 'slug' }
parser.parse("(admin)"); // { raw: '(admin)', type: 'group', name: 'admin' }
parser.parse("@modal"); // { raw: '@modal', type: 'parallel', name: 'modal' }
```

### 构建路由模式

```typescript
import { createBuilder } from "@openspace/pathe/core";

const builder = createBuilder();
const route = builder.build([
    { raw: "blog", type: "static" },
    { raw: "[id]", type: "dynamic", name: "id" },
]);

console.log(route.pattern); // '/blog/:id'
```

### 匹配 URL

```typescript
import { createMatcher } from "@openspace/pathe/core";

const matcher = createMatcher();
const result = matcher.match("/blog/123", route);

console.log(result?.params); // { id: '123' }
```

### 生成 URL

```typescript
import { generatePath } from "@openspace/pathe/core";

// 基础用法
const path = generatePath('/blog/:slug', { slug: 'hello' });
// => '/blog/hello'

// 处理 catch-all
const path2 = generatePath('/shop/:path+', { path: ['a', 'b'] });
// => '/shop/a/b'

// 错误处理配置
// throwOnMissing: false (默认 true) - 缺参时不抛错，返回原始模式
const raw = generatePath('/blog/:id', {}, { throwOnMissing: false });
// => '/blog/:id'
```

### 排序路由树

```typescript
import { createSorter } from "@openspace/pathe/core";

const sorter = createSorter();
const sortedTree = sorter.arrange(tree.root);
```

### 验证路由树

```typescript
import { createValidator } from "@openspace/pathe/core";

const validator = createValidator();
// 验证内容：
// - 重复静态路由
// - 动态路由冲突
// - 并行路由/拦截路由结构完整性
// - 中间件孤儿检测
const result = validator.validate(tree);

if (!result.valid) {
    console.error(result.errors);
}
```

### 序列化 / 反序列化

```typescript
import { deserialize, serialize } from "@openspace/pathe/core";

const json = serialize(tree);
const restored = deserialize(json);
```

## 文件约定

### 默认支持的文件类型

| 类型      | 文件名       | 说明                     |
| :-------- | :----------- | :----------------------- |
| **Core**  | `page`       | 页面入口                 |
|           | `layout`     | 布局（嵌套共享）         |
|           | `template`   | 模板（每次导航重新挂载） |
|           | `loading`    | 加载状态                 |
|           | `default`    | 并行路由默认状态         |
| **Error** | `error`      | 错误边界                 |
|           | `404`        | 404 页面                 |
| **API**   | `route`      | API 端点                 |
|           | `middleware` | 中间件                   |
| **Meta**  | `robots`     | robots.txt               |
|           | `sitemap`    | sitemap.xml              |
|           | `manifest`   | manifest.json            |

### 自定义约定

```typescript
import { defineConvention } from "@openspace/pathe";

// 仅核心 + 错误处理
const minimal = defineConvention({
    presets: ["core", "error"],
});

// 添加自定义类型
type CustomFile = RouteFile | "analytics";
const custom = defineConvention<CustomFile>({
    include: ["analytics"],
});

// 使用自定义约定扫描
const scanner = createScanner({ convention: custom });
```

## 段类型

| 类型               | 示例          | URL 模式       |
| :----------------- | :------------ | :------------- |
| `static`           | `blog`        | `/blog`        |
| `dynamic`          | `[id]`        | `/blog/:id`    |
| `catchAll`         | `[...slug]`   | `/shop/:slug+` |
| `optionalCatchAll` | `[[...slug]]` | `/shop/:slug*` |
| `group`            | `(admin)`     | 不影响 URL     |
| `parallel`         | `@modal`      | 并行渲染插槽   |
| `interceptSame`    | `(.)photo`    | 同级拦截       |
| `interceptParent`  | `(..)photo`   | 父级拦截       |
| `interceptRoot`    | `(...)photo`  | 根级拦截       |

## API 导出

### `@openspace/pathe`

- `defineConvention()` - 创建文件约定
- 类型：`RouteFile`, `FileConvention`, `RouteTree`, `RouteNode`, `Segment`...

### `@openspace/pathe/core`

- `createParser()` - 段解析器
- `createBuilder()` - 路由构建器
- `createMatcher()` - URL 匹配器
- `generatePath()` - URL 生成器
- `createSorter()` - 路由排序器
- `createValidator()` - 路由验证器
- `createCollector()` - 静态参数收集器
- `serialize()` / `deserialize()` - 序列化工具

### `@openspace/pathe/node`

- `createScanner()` - 文件系统扫描器（Node.js 专用）

## License

MIT
