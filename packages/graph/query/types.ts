/**
 * @fileoverview 查询系统类型定义
 */

import type { Edge, Node } from '../types/entities';
import type { EndpointDirection } from '../types/schema';
import type { NodeId } from '../types/identity';

// ============================================================================
// 过滤条件
// ============================================================================

/**
 * 节点过滤条件
 */
export interface NodeFilter {
    /** 节点类型列表（OR 关系） */
    readonly types?: readonly string[];
    /** 标签列表（AND 关系） */
    readonly tags?: readonly string[];
    /** 端点约束 */
    readonly hasEndpoint?: {
        readonly direction?: EndpointDirection;
        readonly dataType?: string;
    };
    /** 自定义谓词函数 */
    readonly predicate?: (node: Node) => boolean;
}

/**
 * 边过滤条件
 */
export interface EdgeFilter {
    /** 边类型列表（OR 关系） */
    readonly types?: readonly string[];
    /** 源节点类型列表 */
    readonly fromNodeTypes?: readonly string[];
    /** 目标节点类型列表 */
    readonly toNodeTypes?: readonly string[];
    /** 自定义谓词函数 */
    readonly predicate?: (edge: Edge) => boolean;
}

// ============================================================================
// 遍历选项
// ============================================================================

/** 遍历方向 */
export type TraversalDirection = 'forward' | 'backward' | 'both';

/**
 * 遍历选项
 */
export interface TraversalOptions {
    /** 遍历方向 */
    readonly direction?: TraversalDirection;
    /** 最大深度（undefined 表示无限制） */
    readonly maxDepth?: number;
    /** 节点过滤器 */
    readonly nodeFilter?: NodeFilter;
    /** 边过滤器 */
    readonly edgeFilter?: EdgeFilter;
    /** 是否包含起始节点 */
    readonly includeStart?: boolean;
}

/**
 * 默认遍历选项
 */
export const DEFAULT_TRAVERSAL_OPTIONS: TraversalOptions = {
    direction: 'forward',
    includeStart: true,
};

// ============================================================================
// 查询结果
// ============================================================================

/**
 * 查询结果
 *
 * @template T - 结果项类型
 */
export interface QueryResult<T> {
    /** 结果列表 */
    readonly items: readonly T[];
    /** 总数 */
    readonly total: number;
}

/**
 * 遍历路径记录
 */
export interface TraversalPath {
    /** 节点 ID */
    readonly nodeId: NodeId;
    /** 到达该节点的深度 */
    readonly depth: number;
    /** 父节点 ID（起始节点为 null） */
    readonly parent: NodeId | null;
}

// ============================================================================
// 子图选项
// ============================================================================

/**
 * 子图提取选项
 */
export interface SubgraphOptions {
    /** 根节点 ID 列表 */
    readonly rootNodes: readonly NodeId[];
    /** 提取深度 */
    readonly depth?: number;
    /** 是否包含边 */
    readonly includeEdges?: boolean;
    /** 节点过滤器 */
    readonly nodeFilter?: NodeFilter;
    /** 边过滤器 */
    readonly edgeFilter?: EdgeFilter;
    /** 遍历方向 */
    readonly direction?: TraversalDirection;
}

// ============================================================================
// 拓扑排序选项
// ============================================================================

/**
 * 拓扑排序结果
 */
export interface TopologicalSortResult {
    /** 排序后的节点 ID 列表 */
    readonly order: readonly NodeId[];
    /** 是否存在循环（如果存在，order 可能不完整） */
    readonly hasCycle: boolean;
    /** 循环中涉及的节点（如果存在） */
    readonly cycleNodes?: readonly NodeId[];
}
