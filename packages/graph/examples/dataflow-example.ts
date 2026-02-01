/**
 * @fileoverview Graph Core 使用示例
 * 演示如何使用 @openspace/graph 构建一个简单的 Dataflow 图
 */

import {
    createBuilder,
    createEndpointId,
    createTraverser,
    createValidator,
    type GraphSchema,
} from '..';

// ============================================================================
// 1. 定义 Schema
// ============================================================================

/**
 * 定义一个简单的 Dataflow 图 Schema
 * 包含两种节点类型：数据源和处理器
 */
const dataflowSchema: GraphSchema = {
    name: 'DataflowSchema',
    version: '1.0.0',
    description: '简单的数据流图 Schema',

    nodeTypes: {
        // 数据源节点
        source: {
            type: 'source',
            description: '数据源节点，只有输出端点',
            endpoints: {
                output: {
                    type: 'data-output',
                    direction: 'output',
                    dataType: { type: 'any' },
                    cardinality: 'many',
                },
            },
        },

        // 处理器节点
        processor: {
            type: 'processor',
            description: '数据处理节点，有输入和输出端点',
            endpoints: {
                input: {
                    type: 'data-input',
                    direction: 'input',
                    dataType: { type: 'any' },
                    cardinality: 'many',
                },
                output: {
                    type: 'data-output',
                    direction: 'output',
                    dataType: { type: 'any' },
                    cardinality: 'many',
                },
            },
        },

        // 终点节点
        sink: {
            type: 'sink',
            description: '数据终点节点，只有输入端点',
            endpoints: {
                input: {
                    type: 'data-input',
                    direction: 'input',
                    dataType: { type: 'any' },
                    cardinality: 'many',
                },
            },
        },
    },

    edgeTypes: {
        // 数据流边
        dataflow: {
            type: 'dataflow',
            description: '表示数据流动的边',
            directed: true,
            sourceConstraint: {
                direction: 'output',
            },
            targetConstraint: {
                direction: 'input',
            },
        },
    },
};

// ============================================================================
// 2. 构建图
// ============================================================================

console.log('=== 构建 Dataflow 图 ===\n');

// 创建构建器
const builder = createBuilder(dataflowSchema, 'my-dataflow-graph')
    .setName('示例数据流')
    .setDescription('演示 Graph Core 的基本用法');

// 添加节点
const sourceId = builder.addNode({
    type: 'source',
    data: { name: 'HTTP 数据源', url: 'https://api.example.com/data' },
});
console.log(`添加数据源节点: ${sourceId}`);

const processor1Id = builder.addNode({
    type: 'processor',
    data: { name: '数据过滤器', filter: 'status === "active"' },
});
console.log(`添加处理器节点: ${processor1Id}`);

const processor2Id = builder.addNode({
    type: 'processor',
    data: { name: '数据转换器', transform: 'map(x => x.value)' },
});
console.log(`添加处理器节点: ${processor2Id}`);

const sinkId = builder.addNode({
    type: 'sink',
    data: { name: '数据库写入', table: 'processed_data' },
});
console.log(`添加终点节点: ${sinkId}`);

// 连接节点
const edge1Id = builder.connect({
    type: 'dataflow',
    fromNode: sourceId,
    fromEndpoint: createEndpointId('output'),
    toNode: processor1Id,
    toEndpoint: createEndpointId('input'),
});
console.log(`\n连接: ${sourceId} -> ${processor1Id}`);

const edge2Id = builder.connect({
    type: 'dataflow',
    fromNode: processor1Id,
    fromEndpoint: createEndpointId('output'),
    toNode: processor2Id,
    toEndpoint: createEndpointId('input'),
});
console.log(`连接: ${processor1Id} -> ${processor2Id}`);

const edge3Id = builder.connect({
    type: 'dataflow',
    fromNode: processor2Id,
    fromEndpoint: createEndpointId('output'),
    toNode: sinkId,
    toEndpoint: createEndpointId('input'),
});
console.log(`连接: ${processor2Id} -> ${sinkId}`);

// 构建最终图
const graph = builder.build();
console.log(`\n图构建完成！节点数: ${graph.nodes.size}, 边数: ${graph.edges.size}`);

// ============================================================================
// 3. 校验图
// ============================================================================

console.log('\n=== 校验图 ===\n');

const validator = createValidator();
const validationResult = validator.validate(graph, dataflowSchema, {
    checkCycles: true,
});

if (validationResult.isValid) {
    console.log('✅ 图校验通过！');
} else {
    console.log('❌ 图校验失败：');
    for (const issue of validationResult.issues) {
        console.log(`  [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
}

// ============================================================================
// 4. 遍历图
// ============================================================================

console.log('\n=== 遍历图 ===\n');

const traverser = createTraverser(graph);

// 从源节点开始 BFS 遍历
console.log('从数据源开始 BFS 遍历:');
const bfsResult = traverser.bfs(sourceId, { direction: 'forward' });
for (const path of bfsResult) {
    const node = graph.nodes.get(path.nodeId);
    console.log(`  深度 ${path.depth}: ${node?.type} (${path.nodeId})`);
}

// 拓扑排序
console.log('\n拓扑排序结果:');
const topoResult = traverser.topologicalSort();
if (!topoResult.hasCycle) {
    for (const nodeId of topoResult.order) {
        const node = graph.nodes.get(nodeId);
        console.log(`  ${node?.type}: ${(node?.data as { name: string })?.name}`);
    }
} else {
    console.log('  图中存在循环！');
}

// ============================================================================
// 5. 查询节点
// ============================================================================

console.log('\n=== 查询节点 ===\n');

const processors = traverser.findNodes({ types: ['processor'] });
console.log(`找到 ${processors.total} 个处理器节点:`);
for (const node of processors.items) {
    console.log(`  - ${(node.data as { name: string })?.name}`);
}

console.log('\n=== 示例完成 ===');

// 为了让这个文件可以被执行，我们暂时忽略 edge 变量未使用的警告
void edge1Id;
void edge2Id;
void edge3Id;
