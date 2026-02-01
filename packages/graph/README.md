# @openspace/graph

> 平台级、领域无关、可扩展的 Graph 元模型核心库

## 概述

`@openspace/graph` 是一个通用图数据结构库，设计用于支持
**任意图类型**（Dependency / Dataflow / Knowledge / Process
等），提供统一的类型系统和运行时能力。

### 核心特性

| 特性         | 说明                                                |
| ------------ | --------------------------------------------------- |
| **一等公民** | Node / Edge / Endpoint 拥有完整的身份标识和生命周期 |
| **强类型**   | 品牌类型确保 ID 类型安全，泛型 Schema 支持类型推导  |
| **领域无关** | Core 层不绑定任何特定领域、存储或 UI                |
| **可扩展**   | 通过 GraphSchema 定义任意图类型和约束               |
| **可演进**   | 支持 Diff、校验、版本快照                           |

---

## 安装

```bash
pnpm add @openspace/graph
```

---

## 快速开始

### 1. 定义 Schema

```typescript
import type { GraphSchema } from "@openspace/graph";

const schema: GraphSchema = {
    name: "DataflowSchema",
    version: "1.0.0",
    nodeTypes: {
        source: {
            type: "source",
            endpoints: {
                output: {
                    type: "data-output",
                    direction: "output",
                    dataType: { type: "any" },
                    cardinality: "many",
                },
            },
        },
        processor: {
            type: "processor",
            endpoints: {
                input: {
                    type: "data-input",
                    direction: "input",
                    dataType: { type: "any" },
                    cardinality: "many",
                },
                output: {
                    type: "data-output",
                    direction: "output",
                    dataType: { type: "any" },
                    cardinality: "many",
                },
            },
        },
    },
    edgeTypes: {
        dataflow: {
            type: "dataflow",
            directed: true,
        },
    },
};
```

### 2. 构建图

```typescript
import { createBuilder, createEndpointId } from "@openspace/graph";

const builder = createBuilder(schema, "my-graph");

// 添加节点
const sourceId = builder.addNode({
    type: "source",
    data: { name: "HTTP API" },
});
const processorId = builder.addNode({
    type: "processor",
    data: { name: "数据过滤" },
});

// 连接节点
builder.connect({
    type: "dataflow",
    fromNode: sourceId,
    fromEndpoint: createEndpointId("output"),
    toNode: processorId,
    toEndpoint: createEndpointId("input"),
});

// 构建不可变图实例
const graph = builder.build();
```

### 3. 校验图

```typescript
import { createValidator } from "@openspace/graph";

const validator = createValidator();
const result = validator.validate(graph, schema, { checkCycles: true });

if (!result.isValid) {
    console.error("校验失败:", result.issues);
}
```

### 4. 遍历图

```typescript
import { createTraverser } from "@openspace/graph";

const traverser = createTraverser(graph);

// BFS 遍历
const paths = traverser.bfs(sourceId, { direction: "forward" });

// 拓扑排序
const { order, hasCycle } = traverser.topologicalSort();

// 查询节点
const processors = traverser.findNodes({ types: ["processor"] });
```

### 5. 计算 Diff

```typescript
import { createDiffer } from "@openspace/graph";

const differ = createDiffer();
const diffResult = differ.diff(oldGraph, newGraph);

console.log("变更摘要:", diffResult.summary);
// { nodesAdded: 1, nodesRemoved: 0, edgesAdded: 1, ... }
```

---

## 模块结构

```
@openspace/graph
├── index.ts            # 公共 API 导出
├── types/              # 核心类型定义
│   ├── identity.ts     # 品牌 ID 类型 (GraphId, NodeId, EdgeId, EndpointId)
│   ├── schema.ts       # Schema 类型 (NodeSchema, EdgeSchema, GraphSchema)
│   └── entities.ts     # 实体类型 (Node, Edge, Endpoint, Graph)
├── builder/            # 图构建器
│   └── graph-builder.ts
├── validation/         # 校验引擎
│   ├── types.ts        # 校验类型
│   ├── rules.ts        # 内置校验规则
│   └── validator.ts    # GraphValidator
├── diff/               # Diff 引擎
│   ├── types.ts        # Change, ChangeSet, DiffResult
│   └── differ.ts       # GraphDiffer
└── query/              # 查询与遍历
    ├── types.ts        # 过滤条件、遍历选项
    └── traverser.ts    # GraphTraverser (BFS/DFS/拓扑排序)
```

---

## 核心概念

### 图模型

```
┌─────────────────────────────────────────────────────────────┐
│                          Graph                              │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │      Node       │         │      Node       │           │
│  │  ┌───────────┐  │  Edge   │  ┌───────────┐  │           │
│  │  │ Endpoint  │──┼────────►│  │ Endpoint  │  │           │
│  │  │ (output)  │  │         │  │ (input)   │  │           │
│  │  └───────────┘  │         │  └───────────┘  │           │
│  └─────────────────┘         └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

- **Graph**: 节点和边的容器
- **Node**: 图中的顶点，包含数据和端点
- **Edge**: 连接两个端点的有向边
- **Endpoint**: 节点的输入/输出接口（Port）

### Schema 系统

Schema 定义图的"蓝图"，约束允许的节点类型、边类型及其结构：

| Schema 类型   | 用途                             |
| ------------- | -------------------------------- |
| `NodeSchema`  | 定义节点的端点结构和数据模式     |
| `EdgeSchema`  | 定义边的约束（源/目标端点限制）  |
| `GraphSchema` | 聚合所有类型定义，作为图的元数据 |

### 品牌类型

使用 TypeScript 品牌类型确保不同 ID 不可混用：

```typescript
const nodeId: NodeId = createNodeId("node-1");
const edgeId: EdgeId = createEdgeId("edge-1");

// ❌ 编译错误：类型不兼容
// nodeId = edgeId;
```

---

## API 参考

### 构建器

| API                                     | 说明                  |
| --------------------------------------- | --------------------- |
| `createBuilder(schema, graphId?)`       | 创建图构建器          |
| `builder.addNode(params)`               | 添加节点，返回 NodeId |
| `builder.addEdge(params)`               | 添加边，返回 EdgeId   |
| `builder.connect(params)`               | 便捷连接两端点        |
| `builder.removeNode(nodeId)`            | 删除节点              |
| `builder.removeEdge(edgeId)`            | 删除边                |
| `builder.build()`                       | 构建不可变图实例      |
| `GraphBuilder.fromGraph(graph, schema)` | 从现有图创建构建器    |

### 校验器

| API                                           | 说明                      |
| --------------------------------------------- | ------------------------- |
| `createValidator(options?)`                   | 创建校验器                |
| `validator.validate(graph, schema, options?)` | 执行完整校验              |
| `validator.validateQuick(graph, schema)`      | 快速校验（仅 error 级别） |

### 遍历器

| API                                          | 说明                  |
| -------------------------------------------- | --------------------- |
| `createTraverser(graph)`                     | 创建遍历器            |
| `traverser.bfs(startNodeId, options?)`       | 广度优先遍历          |
| `traverser.dfs(startNodeId, options?)`       | 深度优先遍历          |
| `traverser.topologicalSort()`                | 拓扑排序（Kahn 算法） |
| `traverser.findNodes(filter)`                | 查询节点              |
| `traverser.findEdges(filter)`                | 查询边                |
| `traverser.getNeighbors(nodeId, direction?)` | 获取邻居节点          |
| `traverser.extractSubgraph(options)`         | 提取子图              |

### Diff 引擎

| API                               | 说明           |
| --------------------------------- | -------------- |
| `createDiffer(options?)`          | 创建 Diff 引擎 |
| `differ.diff(oldGraph, newGraph)` | 计算两图差异   |

---

## 内置校验规则

| 规则代码                    | 级别    | 说明                         |
| --------------------------- | ------- | ---------------------------- |
| `GRAPH_ORPHAN_NODE`         | warning | 检测孤立节点                 |
| `GRAPH_EDGE_INTEGRITY`      | error   | 边引用的端点必须存在         |
| `NODE_UNKNOWN_TYPE`         | error   | 节点类型必须在 Schema 中注册 |
| `NODE_ENDPOINT_CARDINALITY` | error   | 端点连接数必须符合基数约束   |
| `EDGE_UNKNOWN_TYPE`         | error   | 边类型必须在 Schema 中注册   |
| `EDGE_DIRECTION_MISMATCH`   | error   | 边的源/目标端点方向必须正确  |
| `GRAPH_CYCLE_DETECTED`      | error   | 检测循环依赖（可选启用）     |

---

## 设计原则

1. **不可变数据**: 所有实体均为 readonly，修改通过 Builder 生成新实例
2. **类型优先**: 充分利用 TypeScript 泛型和条件类型
3. **零运行时依赖**: 纯 TypeScript 实现，无外部依赖
4. **关注点分离**: 类型定义、运行时操作、校验逻辑独立模块化

---

## License

MIT
