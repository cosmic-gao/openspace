/**
 * @fileoverview 图构建器
 * 提供流式 API 构建图
 */

import type { Edge, Graph, Node, Endpoint } from '../types/entities';
import { createBaseMetadata, createGraph } from '../types/entities';
import type { GraphSchema } from '../types/schema';
import {
    createEdgeId,
    createEndpointId,
    createConnection,
    createGraphId,
    createNodeId,
    type EdgeId,
    type EndpointId,
    type EndpointRef,
    type GraphId,
    type NodeId,
} from '../types/identity';

// ============================================================================
// 构建器类型
// ============================================================================

/**
 * 添加节点的参数
 */
export interface AddNodeParams<TData = unknown> {
    /** 节点 ID（可选，不提供则自动生成） */
    id?: string;
    /** 节点类型 */
    type: string;
    /** 节点数据 */
    data?: TData;
    /** 标签 */
    tags?: string[];
}

/**
 * 添加边的参数
 */
export interface AddEdgeParams<TData = unknown> {
    /** 边 ID（可选，不提供则自动生成） */
    id?: string;
    /** 边类型 */
    type: string;
    /** 源端点引用 */
    source: EndpointRef;
    /** 目标端点引用 */
    target: EndpointRef;
    /** 边数据 */
    data?: TData;
}

/**
 * 便捷创建边的参数
 */
export interface ConnectParams<TData = unknown> {
    /** 边类型 */
    type: string;
    /** 源节点 ID */
    fromNode: NodeId;
    /** 源端点 ID */
    fromEndpoint: EndpointId;
    /** 目标节点 ID */
    toNode: NodeId;
    /** 目标端点 ID */
    toEndpoint: EndpointId;
    /** 边数据 */
    data?: TData;
}

// ============================================================================
// 图构建器
// ============================================================================

/**
 * 图构建器
 * 提供链式 API 构建和修改图
 *
 * @example
 * const graph = new GraphBuilder(schema)
 *   .addNode({ type: 'function', data: { name: 'foo' } })
 *   .addNode({ type: 'function', data: { name: 'bar' } })
 *   .connect({
 *     type: 'calls',
 *     fromNode: node1Id,
 *     fromEndpoint: 'output',
 *     toNode: node2Id,
 *     toEndpoint: 'input',
 *   })
 *   .build();
 */
export class GraphBuilder {
    private readonly schema: GraphSchema;
    private readonly nodes: Map<NodeId, Node>;
    private readonly edges: Map<EdgeId, Edge>;
    private graphId: GraphId;
    private graphName?: string;
    private graphDescription?: string;
    private nodeCounter: number = 0;
    private edgeCounter: number = 0;

    constructor(schema: GraphSchema, graphId?: string) {
        this.schema = schema;
        this.nodes = new Map();
        this.edges = new Map();
        this.graphId = createGraphId(graphId ?? this.generateId('graph'));
    }

    /**
     * 设置图名称
     */
    setName(name: string): this {
        this.graphName = name;
        return this;
    }

    /**
     * 设置图描述
     */
    setDescription(description: string): this {
        this.graphDescription = description;
        return this;
    }

    /**
     * 添加节点
     *
     * @param params - 节点参数
     * @returns 新节点的 ID
     */
    addNode<TData = unknown>(params: AddNodeParams<TData>): NodeId {
        const nodeId = createNodeId(params.id ?? this.generateId('node'));
        const nodeSchema = this.schema.nodeTypes[params.type];

        // 创建端点
        const endpoints = new Map<EndpointId, Endpoint>();
        if (nodeSchema) {
            for (const [endpointName, endpointSchema] of Object.entries(
                nodeSchema.endpoints
            )) {
                const endpointId = createEndpointId(endpointName);
                endpoints.set(endpointId, {
                    id: endpointId,
                    type: endpointSchema.type,
                    direction: endpointSchema.direction,
                    dataType: endpointSchema.dataType,
                    cardinality: endpointSchema.cardinality,
                    connectedEdges: [],
                    data: endpointSchema.defaultData,
                });
            }
        }

        const node: Node = {
            id: nodeId,
            type: params.type,
            data: params.data ?? nodeSchema?.defaultData,
            endpoints,
            metadata: {
                ...createBaseMetadata(),
                tags: params.tags,
            },
        };

        this.nodes.set(nodeId, node);
        return nodeId;
    }

    /**
     * 添加边
     *
     * @param params - 边参数
     * @returns 新边的 ID
     */
    addEdge<TData = unknown>(params: AddEdgeParams<TData>): EdgeId {
        const edgeId = createEdgeId(params.id ?? this.generateId('edge'));
        const edgeSchema = this.schema.edgeTypes[params.type];

        const edge: Edge = {
            id: edgeId,
            type: params.type,
            data: params.data ?? edgeSchema?.defaultData,
            source: params.source,
            target: params.target,
            metadata: createBaseMetadata(),
        };

        this.edges.set(edgeId, edge);

        // 更新端点的连接列表
        this.addEdgeToEndpoint(params.source, edgeId);
        this.addEdgeToEndpoint(params.target, edgeId);

        return edgeId;
    }

    /**
     * 便捷方法：连接两个端点
     *
     * @param params - 连接参数
     * @returns 新边的 ID
     */
    connect<TData = unknown>(params: ConnectParams<TData>): EdgeId {
        return this.addEdge({
            type: params.type,
            source: createConnection(params.fromNode, params.fromEndpoint),
            target: createConnection(params.toNode, params.toEndpoint),
            data: params.data,
        });
    }

    /**
     * 删除节点
     *
     * @param nodeId - 节点 ID
     * @param removeConnectedEdges - 是否同时删除连接的边（默认 true）
     */
    removeNode(nodeId: NodeId, removeConnectedEdges: boolean = true): this {
        const node = this.nodes.get(nodeId);
        if (!node) return this;

        if (removeConnectedEdges) {
            // 收集所有连接的边
            const edgesToRemove: EdgeId[] = [];
            for (const endpoint of node.endpoints.values()) {
                edgesToRemove.push(...endpoint.connectedEdges);
            }

            // 删除边
            for (const edgeId of edgesToRemove) {
                this.removeEdge(edgeId);
            }
        }

        this.nodes.delete(nodeId);
        return this;
    }

    /**
     * 删除边
     *
     * @param edgeId - 边 ID
     */
    removeEdge(edgeId: EdgeId): this {
        const edge = this.edges.get(edgeId);
        if (!edge) return this;

        // 从端点中移除引用
        this.removeEdgeFromEndpoint(edge.source, edgeId);
        this.removeEdgeFromEndpoint(edge.target, edgeId);

        this.edges.delete(edgeId);
        return this;
    }

    /**
     * 获取节点
     */
    getNode(nodeId: NodeId): Node | undefined {
        return this.nodes.get(nodeId);
    }

    /**
     * 获取边
     */
    getEdge(edgeId: EdgeId): Edge | undefined {
        return this.edges.get(edgeId);
    }

    /**
     * 获取所有节点
     */
    getNodes(): Node[] {
        return [...this.nodes.values()];
    }

    /**
     * 获取所有边
     */
    getEdges(): Edge[] {
        return [...this.edges.values()];
    }

    /**
     * 构建最终的图实例
     *
     * @returns 不可变的图实例
     */
    build(): Graph {
        return {
            ...createGraph({
                id: this.graphId,
                schemaName: this.schema.name,
                schemaVersion: this.schema.version,
                name: this.graphName,
                description: this.graphDescription,
            }),
            nodes: new Map(this.nodes),
            edges: new Map(this.edges),
        };
    }

    /**
     * 从现有图创建构建器（用于修改）
     */
    static fromGraph(graph: Graph, schema: GraphSchema): GraphBuilder {
        const builder = new GraphBuilder(schema, graph.id);
        builder.graphName = graph.metadata.name;
        builder.graphDescription = graph.metadata.description;

        // 复制节点
        for (const [nodeId, node] of graph.nodes) {
            builder.nodes.set(nodeId, { ...node });
        }

        // 复制边
        for (const [edgeId, edge] of graph.edges) {
            builder.edges.set(edgeId, { ...edge });
        }

        return builder;
    }

    // ==========================================================================
    // 私有方法
    // ==========================================================================

    /**
     * 生成唯一 ID
     */
    private generateId(prefix: string): string {
        if (prefix === 'node') {
            return `${prefix}-${++this.nodeCounter}`;
        }
        if (prefix === 'edge') {
            return `${prefix}-${++this.edgeCounter}`;
        }
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }

    /**
     * 将边添加到端点的连接列表
     */
    private addEdgeToEndpoint(ref: EndpointRef, edgeId: EdgeId): void {
        const node = this.nodes.get(ref.nodeId);
        if (!node) return;

        const endpoint = node.endpoints.get(ref.endpointId);
        if (!endpoint) return;

        // 创建新的端点（不可变更新）
        const updatedEndpoint: Endpoint = {
            ...endpoint,
            connectedEdges: [...endpoint.connectedEdges, edgeId],
        };

        // 创建新的端点映射
        const updatedEndpoints = new Map(node.endpoints);
        updatedEndpoints.set(ref.endpointId, updatedEndpoint);

        // 更新节点
        this.nodes.set(ref.nodeId, {
            ...node,
            endpoints: updatedEndpoints,
        });
    }

    /**
     * 从端点的连接列表中移除边
     */
    private removeEdgeFromEndpoint(ref: EndpointRef, edgeId: EdgeId): void {
        const node = this.nodes.get(ref.nodeId);
        if (!node) return;

        const endpoint = node.endpoints.get(ref.endpointId);
        if (!endpoint) return;

        const updatedEndpoint: Endpoint = {
            ...endpoint,
            connectedEdges: endpoint.connectedEdges.filter((id) => id !== edgeId),
        };

        const updatedEndpoints = new Map(node.endpoints);
        updatedEndpoints.set(ref.endpointId, updatedEndpoint);

        this.nodes.set(ref.nodeId, {
            ...node,
            endpoints: updatedEndpoints,
        });
    }
}

/**
 * 创建图构建器的便捷函数
 */
export function createBuilder(
    schema: GraphSchema,
    graphId?: string
): GraphBuilder {
    return new GraphBuilder(schema, graphId);
}
