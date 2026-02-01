/**
 * @fileoverview 核心标识类型定义
 * 使用品牌类型（Branded Type）确保不同 ID 类型的类型安全
 */

// ============================================================================
// 品牌类型基础设施
// ============================================================================

/**
 * 品牌类型工具 - 为基础类型添加类型标记
 * 防止不同语义的 ID 之间混用
 *
 * @example
 * const nodeId = createNodeId('node-1');
 * const edgeId = createEdgeId('edge-1');
 * // nodeId = edgeId; // 编译错误：类型不兼容
 */
declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

// ============================================================================
// ID 类型定义
// ============================================================================

/** 图 ID - 唯一标识一个图实例 */
export type GraphId = Brand<string, 'GraphId'>;

/** 节点 ID - 唯一标识一个节点 */
export type NodeId = Brand<string, 'NodeId'>;

/** 边 ID - 唯一标识一条边 */
export type EdgeId = Brand<string, 'EdgeId'>;

/** 端点 ID - 唯一标识一个端点（在节点内唯一） */
export type EndpointId = Brand<string, 'EndpointId'>;

// ============================================================================
// 引用类型
// ============================================================================

/**
 * 端点引用 - 精确定位图中的一个端点
 * 由节点 ID 和端点 ID 组合而成
 */
export interface EndpointRef {
    /** 所属节点 ID */
    readonly nodeId: NodeId;
    /** 端点 ID */
    readonly endpointId: EndpointId;
}

// ============================================================================
// ID 工厂函数
// ============================================================================

/**
 * 创建图 ID
 * @param id - 原始字符串 ID
 * @returns 品牌化的 GraphId
 */
export function createGraphId(id: string): GraphId {
    return id as GraphId;
}

/**
 * 创建节点 ID
 * @param id - 原始字符串 ID
 * @returns 品牌化的 NodeId
 */
export function createNodeId(id: string): NodeId {
    return id as NodeId;
}

/**
 * 创建边 ID
 * @param id - 原始字符串 ID
 * @returns 品牌化的 EdgeId
 */
export function createEdgeId(id: string): EdgeId {
    return id as EdgeId;
}

/**
 * 创建端点 ID
 * @param id - 原始字符串 ID
 * @returns 品牌化的 EndpointId
 */
export function createEndpointId(id: string): EndpointId {
    return id as EndpointId;
}

/**
 * 创建端点引用
 * @param nodeId - 节点 ID
 * @param endpointId - 端点 ID
 * @returns 端点引用对象
 */
export function createEndpointRef(
    nodeId: NodeId,
    endpointId: EndpointId
): EndpointRef {
    return { nodeId, endpointId };
}

// ============================================================================
// ID 比较工具
// ============================================================================

/**
 * 比较两个端点引用是否相等
 */
export function endpointRefEquals(a: EndpointRef, b: EndpointRef): boolean {
    return a.nodeId === b.nodeId && a.endpointId === b.endpointId;
}

/**
 * 获取端点引用的字符串表示
 */
export function endpointRefToString(ref: EndpointRef): string {
    return `${ref.nodeId}:${ref.endpointId}`;
}

/**
 * 从字符串解析端点引用
 */
export function parseEndpointRef(str: string): EndpointRef | null {
    const parts = str.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return null;
    }
    return createEndpointRef(
        createNodeId(parts[0]),
        createEndpointId(parts[1])
    );
}
