/**
 * @fileoverview 图校验器
 */

import type { Graph } from '../types/entities';
import type { GraphSchema } from '../types/schema';
import {
    builtinEdgeRules,
    builtinGraphRules,
    builtinNodeRules,
} from './rules';
import type {
    EdgeValidationRule,
    GraphValidationRule,
    NodeValidationRule,
    ValidationContext,
    ValidationIssue,
    ValidationOptions,
    ValidationResult,
} from './types';
import { DEFAULT_VALIDATION_OPTIONS } from './types';

/**
 * 图校验器
 * 负责验证图的结构完整性和 Schema 约束
 */
export class GraphValidator {
    private readonly graphRules: GraphValidationRule[];
    private readonly nodeRules: NodeValidationRule[];
    private readonly edgeRules: EdgeValidationRule[];

    constructor(options: Partial<ValidationOptions> = {}) {
        // 合并内置规则和自定义规则
        this.graphRules = [
            ...builtinGraphRules,
            ...(options.graphRules ?? []),
        ];
        this.nodeRules = [
            ...builtinNodeRules,
            ...(options.nodeRules ?? []),
        ];
        this.edgeRules = [
            ...builtinEdgeRules,
            ...(options.edgeRules ?? []),
        ];
    }

    /**
     * 验证整个图
     *
     * @param graph - 要验证的图
     * @param schema - 图的 Schema
     * @param options - 校验选项
     * @returns 校验结果
     *
     * @example
     * const validator = new GraphValidator();
     * const result = validator.validate(graph, schema);
     * if (!result.isValid) {
     *   console.error('校验失败:', result.issues);
     * }
     */
    validate(
        graph: Graph,
        schema: GraphSchema,
        options: Partial<ValidationOptions> = {}
    ): ValidationResult {
        const mergedOptions: ValidationOptions = {
            ...DEFAULT_VALIDATION_OPTIONS,
            ...options,
        };

        const context: ValidationContext = {
            graph,
            schema,
            options: mergedOptions,
        };

        const issues: ValidationIssue[] = [];

        // 执行图级别规则
        for (const rule of this.graphRules) {
            issues.push(...rule.validate(graph, context));
        }

        // 执行节点级别规则
        if (mergedOptions.checkSchema) {
            for (const node of graph.nodes.values()) {
                for (const rule of this.nodeRules) {
                    issues.push(...rule.validate(node, context));
                }
            }
        }

        // 执行边级别规则
        if (mergedOptions.checkConnectivity) {
            for (const edge of graph.edges.values()) {
                for (const rule of this.edgeRules) {
                    issues.push(...rule.validate(edge, context));
                }
            }
        }

        // 检查循环（如果需要）
        if (mergedOptions.checkCycles) {
            const cycleIssues = this.detectCycles(graph);
            issues.push(...cycleIssues);
        }

        return {
            isValid: !issues.some((issue) => issue.severity === 'error'),
            issues,
        };
    }

    /**
     * 快速验证（仅检查错误级别问题）
     */
    validateQuick(graph: Graph, schema: GraphSchema): boolean {
        const result = this.validate(graph, schema, {
            checkCycles: false,
        });
        return result.isValid;
    }

    /**
     * 检测图中的循环
     */
    private detectCycles(graph: Graph): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (nodeId: string, path: string[]): boolean => {
            visited.add(nodeId);
            recursionStack.add(nodeId);

            const node = graph.nodes.get(nodeId as never);
            if (!node) return false;

            // 查找从该节点出发的所有边
            for (const endpoint of node.endpoints.values()) {
                if (endpoint.direction !== 'output') continue;

                for (const edgeId of endpoint.connectedEdges) {
                    const edge = graph.edges.get(edgeId);
                    if (!edge) continue;

                    const targetNodeId = edge.target.nodeId;

                    if (recursionStack.has(targetNodeId)) {
                        // 发现循环
                        issues.push({
                            severity: 'error',
                            code: 'GRAPH_CYCLE_DETECTED',
                            message: `检测到循环依赖: ${[...path, nodeId, targetNodeId].join(' -> ')}`,
                            path: ['graph'],
                            context: {
                                cycle: [...path, nodeId, targetNodeId],
                            },
                        });
                        return true;
                    }

                    if (!visited.has(targetNodeId)) {
                        if (dfs(targetNodeId, [...path, nodeId])) {
                            return true;
                        }
                    }
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        for (const nodeId of graph.nodes.keys()) {
            if (!visited.has(nodeId)) {
                dfs(nodeId, []);
            }
        }

        return issues;
    }
}

/**
 * 创建校验器实例的便捷函数
 */
export function createValidator(
    options?: Partial<ValidationOptions>
): GraphValidator {
    return new GraphValidator(options);
}
