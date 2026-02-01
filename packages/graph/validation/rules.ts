/**
 * @fileoverview 内置校验规则
 */

import type { Edge, Endpoint, Graph, Node } from '../types/entities';
import type { CardinalityRange } from '../types/schema';
import type {
    EdgeValidationRule,
    GraphValidationRule,
    NodeValidationRule,
    ValidationContext,
    ValidationIssue,
} from './types';

// ============================================================================
// 图级别规则
// ============================================================================

/**
 * 检查图是否有孤立节点（无任何连接的节点）
 */
export const orphanNodeRule: GraphValidationRule = {
    code: 'GRAPH_ORPHAN_NODE',
    description: '检查图中是否存在孤立节点',
    severity: 'warning',
    validate(graph: Graph, _context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        for (const [nodeId, node] of graph.nodes) {
            let hasConnection = false;

            for (const endpoint of node.endpoints.values()) {
                if (endpoint.connectedEdges.length > 0) {
                    hasConnection = true;
                    break;
                }
            }

            if (!hasConnection) {
                issues.push({
                    severity: 'warning',
                    code: 'GRAPH_ORPHAN_NODE',
                    message: `节点 "${nodeId}" 没有任何连接`,
                    path: ['nodes', nodeId],
                    context: { nodeType: node.type },
                });
            }
        }

        return issues;
    },
};

/**
 * 检查边引用的端点是否存在
 */
export const edgeIntegrityRule: GraphValidationRule = {
    code: 'GRAPH_EDGE_INTEGRITY',
    description: '检查边引用的端点是否存在',
    severity: 'error',
    validate(graph: Graph, _context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        for (const [edgeId, edge] of graph.edges) {
            // 检查源节点
            const sourceNode = graph.nodes.get(edge.source.nodeId);
            if (!sourceNode) {
                issues.push({
                    severity: 'error',
                    code: 'GRAPH_EDGE_INTEGRITY',
                    message: `边 "${edgeId}" 的源节点 "${edge.source.nodeId}" 不存在`,
                    path: ['edges', edgeId, 'source'],
                });
            } else {
                const sourceEndpoint = sourceNode.endpoints.get(edge.source.endpointId);
                if (!sourceEndpoint) {
                    issues.push({
                        severity: 'error',
                        code: 'GRAPH_EDGE_INTEGRITY',
                        message: `边 "${edgeId}" 的源端点 "${edge.source.endpointId}" 不存在`,
                        path: ['edges', edgeId, 'source'],
                    });
                }
            }

            // 检查目标节点
            const targetNode = graph.nodes.get(edge.target.nodeId);
            if (!targetNode) {
                issues.push({
                    severity: 'error',
                    code: 'GRAPH_EDGE_INTEGRITY',
                    message: `边 "${edgeId}" 的目标节点 "${edge.target.nodeId}" 不存在`,
                    path: ['edges', edgeId, 'target'],
                });
            } else {
                const targetEndpoint = targetNode.endpoints.get(edge.target.endpointId);
                if (!targetEndpoint) {
                    issues.push({
                        severity: 'error',
                        code: 'GRAPH_EDGE_INTEGRITY',
                        message: `边 "${edgeId}" 的目标端点 "${edge.target.endpointId}" 不存在`,
                        path: ['edges', edgeId, 'target'],
                    });
                }
            }
        }

        return issues;
    },
};

// ============================================================================
// 节点级别规则
// ============================================================================

/**
 * 检查节点类型是否在 Schema 中注册
 */
export const nodeTypeRule: NodeValidationRule = {
    code: 'NODE_UNKNOWN_TYPE',
    description: '检查节点类型是否在 Schema 中注册',
    severity: 'error',
    validate(node: Node, context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        if (!context.schema.nodeTypes[node.type]) {
            issues.push({
                severity: 'error',
                code: 'NODE_UNKNOWN_TYPE',
                message: `节点类型 "${node.type}" 未在 Schema 中注册`,
                path: ['nodes', node.id, 'type'],
            });
        }

        return issues;
    },
};

/**
 * 检查端点基数约束
 */
export const endpointCardinalityRule: NodeValidationRule = {
    code: 'NODE_ENDPOINT_CARDINALITY',
    description: '检查端点连接数是否符合基数约束',
    severity: 'error',
    validate(node: Node, _context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        for (const [endpointId, endpoint] of node.endpoints) {
            const connectionCount = endpoint.connectedEdges.length;
            const cardinality = endpoint.cardinality;

            if (!checkCardinality(connectionCount, cardinality)) {
                issues.push({
                    severity: 'error',
                    code: 'NODE_ENDPOINT_CARDINALITY',
                    message: `端点 "${endpointId}" 的连接数 ${connectionCount} 不符合基数约束`,
                    path: ['nodes', node.id, 'endpoints', endpointId],
                    context: {
                        connectionCount,
                        cardinality,
                    },
                });
            }
        }

        return issues;
    },
};

/**
 * 检查连接数是否符合基数约束
 */
function checkCardinality(
    count: number,
    cardinality: Endpoint['cardinality']
): boolean {
    if (cardinality === 'one') {
        return count <= 1;
    }
    if (cardinality === 'many') {
        return true;
    }
    // CardinalityRange
    const range = cardinality as CardinalityRange;
    return count >= range.min && count <= range.max;
}

// ============================================================================
// 边级别规则
// ============================================================================

/**
 * 检查边类型是否在 Schema 中注册
 */
export const edgeTypeRule: EdgeValidationRule = {
    code: 'EDGE_UNKNOWN_TYPE',
    description: '检查边类型是否在 Schema 中注册',
    severity: 'error',
    validate(edge: Edge, context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        if (!context.schema.edgeTypes[edge.type]) {
            issues.push({
                severity: 'error',
                code: 'EDGE_UNKNOWN_TYPE',
                message: `边类型 "${edge.type}" 未在 Schema 中注册`,
                path: ['edges', edge.id, 'type'],
            });
        }

        return issues;
    },
};

/**
 * 检查边的方向约束
 */
export const edgeDirectionRule: EdgeValidationRule = {
    code: 'EDGE_DIRECTION_MISMATCH',
    description: '检查边连接的端点方向是否正确',
    severity: 'error',
    validate(edge: Edge, context: ValidationContext): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const { graph } = context;

        const sourceNode = graph.nodes.get(edge.source.nodeId);
        const targetNode = graph.nodes.get(edge.target.nodeId);

        if (sourceNode && targetNode) {
            const sourceEndpoint = sourceNode.endpoints.get(edge.source.endpointId);
            const targetEndpoint = targetNode.endpoints.get(edge.target.endpointId);

            if (sourceEndpoint && sourceEndpoint.direction === 'input') {
                issues.push({
                    severity: 'error',
                    code: 'EDGE_DIRECTION_MISMATCH',
                    message: `边 "${edge.id}" 的源端点不能是 input 类型`,
                    path: ['edges', edge.id, 'source'],
                });
            }

            if (targetEndpoint && targetEndpoint.direction === 'output') {
                issues.push({
                    severity: 'error',
                    code: 'EDGE_DIRECTION_MISMATCH',
                    message: `边 "${edge.id}" 的目标端点不能是 output 类型`,
                    path: ['edges', edge.id, 'target'],
                });
            }
        }

        return issues;
    },
};

// ============================================================================
// 规则集合
// ============================================================================

/** 内置图级别规则 */
export const builtinGraphRules: readonly GraphValidationRule[] = [
    orphanNodeRule,
    edgeIntegrityRule,
];

/** 内置节点级别规则 */
export const builtinNodeRules: readonly NodeValidationRule[] = [
    nodeTypeRule,
    endpointCardinalityRule,
];

/** 内置边级别规则 */
export const builtinEdgeRules: readonly EdgeValidationRule[] = [
    edgeTypeRule,
    edgeDirectionRule,
];
