/**
 * @fileoverview 图遍历与查询引擎
 */

import type { Edge, Graph, Node } from '../types/entities';
import type { NodeId, EdgeId } from '../types/identity';
import type {
    EdgeFilter,
    NodeFilter,
    QueryResult,
    SubgraphOptions,
    TopologicalSortResult,
    TraversalOptions,
    TraversalPath,
} from './types';
import { DEFAULT_TRAVERSAL_OPTIONS } from './types';

/**
 * 图遍历器
 * 提供图的遍历、查询和子图提取功能
 */
export class GraphTraverser {
    private readonly graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }

    // ==========================================================================
    // 节点查询
    // ==========================================================================

    /**
     * 查询符合条件的节点
     *
     * @param filter - 过滤条件
     * @returns 查询结果
     *
     * @example
     * const result = traverser.findNodes({ types: ['function'] });
     */
    findNodes(filter: NodeFilter): QueryResult<Node> {
        const items: Node[] = [];

        for (const node of this.graph.nodes.values()) {
            if (this.matchesNodeFilter(node, filter)) {
                items.push(node);
            }
        }

        return { items, total: items.length };
    }

    /**
     * 查询符合条件的边
     *
     * @param filter - 过滤条件
     * @returns 查询结果
     */
    findEdges(filter: EdgeFilter): QueryResult<Edge> {
        const items: Edge[] = [];

        for (const edge of this.graph.edges.values()) {
            if (this.matchesEdgeFilter(edge, filter)) {
                items.push(edge);
            }
        }

        return { items, total: items.length };
    }

    // ==========================================================================
    // 图遍历
    // ==========================================================================

    /**
     * 广度优先遍历
     *
     * @param startNodeId - 起始节点 ID
     * @param options - 遍历选项
     * @returns 遍历路径列表
     */
    bfs(
        startNodeId: NodeId,
        options: Partial<TraversalOptions> = {}
    ): TraversalPath[] {
        const opts = { ...DEFAULT_TRAVERSAL_OPTIONS, ...options };
        const visited = new Set<NodeId>();
        const result: TraversalPath[] = [];
        const queue: TraversalPath[] = [
            { nodeId: startNodeId, depth: 0, parent: null },
        ];

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (visited.has(current.nodeId)) continue;
            if (opts.maxDepth !== undefined && current.depth > opts.maxDepth) continue;

            visited.add(current.nodeId);

            const node = this.graph.nodes.get(current.nodeId);
            if (!node) continue;

            // 应用节点过滤器
            if (opts.nodeFilter && !this.matchesNodeFilter(node, opts.nodeFilter)) {
                continue;
            }

            // 包含起始节点或非起始节点
            if (current.depth > 0 || opts.includeStart) {
                result.push(current);
            }

            // 获取邻居节点
            const neighbors = this.getNeighbors(current.nodeId, opts.direction ?? 'forward');
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    queue.push({
                        nodeId: neighborId,
                        depth: current.depth + 1,
                        parent: current.nodeId,
                    });
                }
            }
        }

        return result;
    }

    /**
     * 深度优先遍历
     *
     * @param startNodeId - 起始节点 ID
     * @param options - 遍历选项
     * @returns 遍历路径列表
     */
    dfs(
        startNodeId: NodeId,
        options: Partial<TraversalOptions> = {}
    ): TraversalPath[] {
        const opts = { ...DEFAULT_TRAVERSAL_OPTIONS, ...options };
        const visited = new Set<NodeId>();
        const result: TraversalPath[] = [];

        const visit = (nodeId: NodeId, depth: number, parent: NodeId | null) => {
            if (visited.has(nodeId)) return;
            if (opts.maxDepth !== undefined && depth > opts.maxDepth) return;

            visited.add(nodeId);

            const node = this.graph.nodes.get(nodeId);
            if (!node) return;

            if (opts.nodeFilter && !this.matchesNodeFilter(node, opts.nodeFilter)) {
                return;
            }

            if (depth > 0 || opts.includeStart) {
                result.push({ nodeId, depth, parent });
            }

            const neighbors = this.getNeighbors(nodeId, opts.direction ?? 'forward');
            for (const neighborId of neighbors) {
                visit(neighborId, depth + 1, nodeId);
            }
        };

        visit(startNodeId, 0, null);
        return result;
    }

    // ==========================================================================
    // 邻居查询
    // ==========================================================================

    /**
     * 获取节点的邻居节点
     *
     * @param nodeId - 节点 ID
     * @param direction - 遍历方向
     * @returns 邻居节点 ID 列表
     */
    getNeighbors(
        nodeId: NodeId,
        direction: 'forward' | 'backward' | 'both' = 'forward'
    ): NodeId[] {
        const neighbors: NodeId[] = [];
        const node = this.graph.nodes.get(nodeId);
        if (!node) return neighbors;

        for (const endpoint of node.endpoints.values()) {
            for (const edgeId of endpoint.connectedEdges) {
                const edge = this.graph.edges.get(edgeId);
                if (!edge) continue;

                if (direction === 'forward' || direction === 'both') {
                    // 从 output 端点出发
                    if (
                        edge.source.nodeId === nodeId &&
                        edge.target.nodeId !== nodeId
                    ) {
                        neighbors.push(edge.target.nodeId);
                    }
                }

                if (direction === 'backward' || direction === 'both') {
                    // 从 input 端点回溯
                    if (
                        edge.target.nodeId === nodeId &&
                        edge.source.nodeId !== nodeId
                    ) {
                        neighbors.push(edge.source.nodeId);
                    }
                }
            }
        }

        return [...new Set(neighbors)]; // 去重
    }

    /**
     * 获取节点的入边
     */
    getIncomingEdges(nodeId: NodeId): Edge[] {
        const edges: Edge[] = [];

        for (const edge of this.graph.edges.values()) {
            if (edge.target.nodeId === nodeId) {
                edges.push(edge);
            }
        }

        return edges;
    }

    /**
     * 获取节点的出边
     */
    getOutgoingEdges(nodeId: NodeId): Edge[] {
        const edges: Edge[] = [];

        for (const edge of this.graph.edges.values()) {
            if (edge.source.nodeId === nodeId) {
                edges.push(edge);
            }
        }

        return edges;
    }

    // ==========================================================================
    // 子图提取
    // ==========================================================================

    /**
     * 提取子图
     *
     * @param options - 子图选项
     * @returns 包含节点和边的子图数据
     */
    extractSubgraph(
        options: SubgraphOptions
    ): { nodes: Node[]; edges: Edge[] } {
        const nodeIds = new Set<NodeId>();
        const edgeIds = new Set<EdgeId>();

        // 从每个根节点开始遍历
        for (const rootId of options.rootNodes) {
            const paths = this.bfs(rootId, {
                maxDepth: options.depth,
                direction: options.direction ?? 'both',
                nodeFilter: options.nodeFilter,
            });

            for (const path of paths) {
                nodeIds.add(path.nodeId);
            }
        }

        // 收集边
        if (options.includeEdges !== false) {
            for (const edge of this.graph.edges.values()) {
                if (
                    nodeIds.has(edge.source.nodeId) &&
                    nodeIds.has(edge.target.nodeId)
                ) {
                    if (!options.edgeFilter || this.matchesEdgeFilter(edge, options.edgeFilter)) {
                        edgeIds.add(edge.id);
                    }
                }
            }
        }

        // 构建结果
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        for (const nodeId of nodeIds) {
            const node = this.graph.nodes.get(nodeId);
            if (node) nodes.push(node);
        }

        for (const edgeId of edgeIds) {
            const edge = this.graph.edges.get(edgeId);
            if (edge) edges.push(edge);
        }

        return { nodes, edges };
    }

    // ==========================================================================
    // 拓扑排序
    // ==========================================================================

    /**
     * 执行拓扑排序
     * 使用 Kahn 算法
     *
     * @returns 拓扑排序结果
     */
    topologicalSort(): TopologicalSortResult {
        const inDegree = new Map<NodeId, number>();
        const order: NodeId[] = [];

        // 初始化入度
        for (const nodeId of this.graph.nodes.keys()) {
            inDegree.set(nodeId, 0);
        }

        // 计算入度
        for (const edge of this.graph.edges.values()) {
            const current = inDegree.get(edge.target.nodeId) ?? 0;
            inDegree.set(edge.target.nodeId, current + 1);
        }

        // 找到入度为 0 的节点
        const queue: NodeId[] = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }

        // Kahn 算法
        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            order.push(nodeId);

            const outgoingEdges = this.getOutgoingEdges(nodeId);
            for (const edge of outgoingEdges) {
                const targetId = edge.target.nodeId;
                const newDegree = (inDegree.get(targetId) ?? 1) - 1;
                inDegree.set(targetId, newDegree);

                if (newDegree === 0) {
                    queue.push(targetId);
                }
            }
        }

        // 检查是否有循环
        const hasCycle = order.length !== this.graph.nodes.size;
        const cycleNodes = hasCycle
            ? [...inDegree.entries()]
                .filter(([, degree]) => degree > 0)
                .map(([nodeId]) => nodeId)
            : undefined;

        return { order, hasCycle, cycleNodes };
    }

    // ==========================================================================
    // 私有方法
    // ==========================================================================

    /**
     * 检查节点是否匹配过滤条件
     */
    private matchesNodeFilter(node: Node, filter: NodeFilter): boolean {
        // 类型过滤
        if (filter.types && filter.types.length > 0) {
            if (!filter.types.includes(node.type)) {
                return false;
            }
        }

        // 标签过滤
        if (filter.tags && filter.tags.length > 0) {
            const nodeTags = node.metadata.tags ?? [];
            if (!filter.tags.every((tag) => nodeTags.includes(tag))) {
                return false;
            }
        }

        // 端点过滤
        if (filter.hasEndpoint) {
            let hasMatchingEndpoint = false;
            for (const endpoint of node.endpoints.values()) {
                const directionMatch =
                    !filter.hasEndpoint.direction ||
                    endpoint.direction === filter.hasEndpoint.direction;
                const dataTypeMatch =
                    !filter.hasEndpoint.dataType ||
                    endpoint.dataType.type === filter.hasEndpoint.dataType;

                if (directionMatch && dataTypeMatch) {
                    hasMatchingEndpoint = true;
                    break;
                }
            }
            if (!hasMatchingEndpoint) return false;
        }

        // 自定义谓词
        if (filter.predicate && !filter.predicate(node)) {
            return false;
        }

        return true;
    }

    /**
     * 检查边是否匹配过滤条件
     */
    private matchesEdgeFilter(edge: Edge, filter: EdgeFilter): boolean {
        // 类型过滤
        if (filter.types && filter.types.length > 0) {
            if (!filter.types.includes(edge.type)) {
                return false;
            }
        }

        // 源节点类型过滤
        if (filter.fromNodeTypes && filter.fromNodeTypes.length > 0) {
            const sourceNode = this.graph.nodes.get(edge.source.nodeId);
            if (!sourceNode || !filter.fromNodeTypes.includes(sourceNode.type)) {
                return false;
            }
        }

        // 目标节点类型过滤
        if (filter.toNodeTypes && filter.toNodeTypes.length > 0) {
            const targetNode = this.graph.nodes.get(edge.target.nodeId);
            if (!targetNode || !filter.toNodeTypes.includes(targetNode.type)) {
                return false;
            }
        }

        // 自定义谓词
        if (filter.predicate && !filter.predicate(edge)) {
            return false;
        }

        return true;
    }
}

/**
 * 创建遍历器实例的便捷函数
 */
export function createTraverser(graph: Graph): GraphTraverser {
    return new GraphTraverser(graph);
}
