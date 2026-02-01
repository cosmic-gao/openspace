/**
 * @fileoverview 图 Diff 引擎
 * 计算两个图之间的差异，支持变更应用
 */

import type { Edge, Graph, Node } from '../types/entities';
import { createGraphId } from '../types/identity';
import type {
    Change,
    ChangeSet,
    DiffOptions,
    DiffResult,
    DiffSummary,
} from './types';
import { DEFAULT_DIFF_OPTIONS } from './types';

/**
 * 生成唯一 ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 简单的对象深度比较
 */
function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (typeof a !== 'object') return false;

    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(objA[key], objB[key]));
}

/**
 * 图 Diff 引擎
 */
export class GraphDiffer {
    private readonly options: DiffOptions;

    constructor(options: Partial<DiffOptions> = {}) {
        this.options = { ...DEFAULT_DIFF_OPTIONS, ...options };
    }

    /**
     * 计算两个图之间的差异
     *
     * @param oldGraph - 旧版本图
     * @param newGraph - 新版本图
     * @returns Diff 结果
     *
     * @example
     * const differ = new GraphDiffer();
     * const result = differ.diff(graphV1, graphV2);
     * console.log('变更摘要:', result.summary);
     */
    diff(oldGraph: Graph, newGraph: Graph): DiffResult {
        const changes: Change[] = [];
        const now = Date.now();

        // 比较节点
        const nodeChanges = this.diffNodes(oldGraph, newGraph, now);
        changes.push(...nodeChanges);

        // 比较边
        const edgeChanges = this.diffEdges(oldGraph, newGraph, now);
        changes.push(...edgeChanges);

        // 比较元数据
        if (this.options.includeMetadata) {
            const metaChanges = this.diffMetadata(oldGraph, newGraph, now);
            changes.push(...metaChanges);
        }

        const summary = this.calculateSummary(changes);

        const changeSet: ChangeSet = {
            id: generateId(),
            graphId: newGraph.id ?? oldGraph.id ?? createGraphId('unknown'),
            fromVersion: oldGraph.metadata.version,
            toVersion: newGraph.metadata.version,
            changes,
            createdAt: now,
        };

        return {
            changeSet,
            summary,
            hasChanges: changes.length > 0,
        };
    }

    /**
     * 比较节点
     */
    private diffNodes(
        oldGraph: Graph,
        newGraph: Graph,
        timestamp: number
    ): Change[] {
        const changes: Change[] = [];

        // 检查删除和更新
        for (const [nodeId, oldNode] of oldGraph.nodes) {
            const newNode = newGraph.nodes.get(nodeId);

            if (!newNode) {
                // 节点被删除
                changes.push({
                    operation: 'remove',
                    target: 'node',
                    path: ['nodes', nodeId],
                    oldValue: this.serializeNode(oldNode),
                    timestamp,
                });
            } else if (!this.nodesEqual(oldNode, newNode)) {
                // 节点被更新
                changes.push({
                    operation: 'update',
                    target: 'node',
                    path: ['nodes', nodeId],
                    oldValue: this.serializeNode(oldNode),
                    newValue: this.serializeNode(newNode),
                    timestamp,
                });
            }
        }

        // 检查新增
        for (const [nodeId, newNode] of newGraph.nodes) {
            if (!oldGraph.nodes.has(nodeId)) {
                changes.push({
                    operation: 'add',
                    target: 'node',
                    path: ['nodes', nodeId],
                    newValue: this.serializeNode(newNode),
                    timestamp,
                });
            }
        }

        return changes;
    }

    /**
     * 比较边
     */
    private diffEdges(
        oldGraph: Graph,
        newGraph: Graph,
        timestamp: number
    ): Change[] {
        const changes: Change[] = [];

        // 检查删除和更新
        for (const [edgeId, oldEdge] of oldGraph.edges) {
            const newEdge = newGraph.edges.get(edgeId);

            if (!newEdge) {
                changes.push({
                    operation: 'remove',
                    target: 'edge',
                    path: ['edges', edgeId],
                    oldValue: this.serializeEdge(oldEdge),
                    timestamp,
                });
            } else if (!this.edgesEqual(oldEdge, newEdge)) {
                changes.push({
                    operation: 'update',
                    target: 'edge',
                    path: ['edges', edgeId],
                    oldValue: this.serializeEdge(oldEdge),
                    newValue: this.serializeEdge(newEdge),
                    timestamp,
                });
            }
        }

        // 检查新增
        for (const [edgeId, newEdge] of newGraph.edges) {
            if (!oldGraph.edges.has(edgeId)) {
                changes.push({
                    operation: 'add',
                    target: 'edge',
                    path: ['edges', edgeId],
                    newValue: this.serializeEdge(newEdge),
                    timestamp,
                });
            }
        }

        return changes;
    }

    /**
     * 比较元数据
     */
    private diffMetadata(
        oldGraph: Graph,
        newGraph: Graph,
        timestamp: number
    ): Change[] {
        const changes: Change[] = [];

        if (!deepEqual(oldGraph.metadata, newGraph.metadata)) {
            changes.push({
                operation: 'update',
                target: 'metadata',
                path: ['metadata'],
                oldValue: oldGraph.metadata,
                newValue: newGraph.metadata,
                timestamp,
            });
        }

        return changes;
    }

    /**
     * 比较两个节点是否相等
     */
    private nodesEqual(a: Node, b: Node): boolean {
        if (a.type !== b.type) return false;
        if (!deepEqual(a.data, b.data)) return false;
        if (a.endpoints.size !== b.endpoints.size) return false;

        for (const [endpointId, endpointA] of a.endpoints) {
            const endpointB = b.endpoints.get(endpointId);
            if (!endpointB) return false;
            if (!deepEqual(endpointA, endpointB)) return false;
        }

        return true;
    }

    /**
     * 比较两条边是否相等
     */
    private edgesEqual(a: Edge, b: Edge): boolean {
        if (a.type !== b.type) return false;
        if (!deepEqual(a.data, b.data)) return false;
        if (a.source.nodeId !== b.source.nodeId) return false;
        if (a.source.endpointId !== b.source.endpointId) return false;
        if (a.target.nodeId !== b.target.nodeId) return false;
        if (a.target.endpointId !== b.target.endpointId) return false;
        return true;
    }

    /**
     * 序列化节点（用于存储变更）
     */
    private serializeNode(node: Node): unknown {
        return {
            id: node.id,
            type: node.type,
            data: node.data,
            endpoints: Object.fromEntries(node.endpoints),
        };
    }

    /**
     * 序列化边
     */
    private serializeEdge(edge: Edge): unknown {
        return {
            id: edge.id,
            type: edge.type,
            data: edge.data,
            source: edge.source,
            target: edge.target,
        };
    }

    /**
     * 计算变更摘要
     */
    private calculateSummary(changes: readonly Change[]): DiffSummary {
        let nodesAdded = 0;
        let nodesRemoved = 0;
        let nodesUpdated = 0;
        let edgesAdded = 0;
        let edgesRemoved = 0;
        let edgesUpdated = 0;

        for (const change of changes) {
            if (change.target === 'node') {
                if (change.operation === 'add') nodesAdded++;
                else if (change.operation === 'remove') nodesRemoved++;
                else if (change.operation === 'update') nodesUpdated++;
            } else if (change.target === 'edge') {
                if (change.operation === 'add') edgesAdded++;
                else if (change.operation === 'remove') edgesRemoved++;
                else if (change.operation === 'update') edgesUpdated++;
            }
        }

        return {
            nodesAdded,
            nodesRemoved,
            nodesUpdated,
            edgesAdded,
            edgesRemoved,
            edgesUpdated,
        };
    }
}

/**
 * 创建 Diff 引擎实例的便捷函数
 */
export function createDiffer(options?: Partial<DiffOptions>): GraphDiffer {
    return new GraphDiffer(options);
}
