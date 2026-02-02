/**
 * 品牌类型基础定义
 *
 * 使用 TypeScript Branded Types 模式区分不同实体的 ID。
 */

/** 品牌类型标记 */
declare const __brand: unique symbol;

/** 品牌类型 */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** 基础 ID 类型 */
export type Id = string;

/** 节点唯一标识 */
export type NodeId = Brand<Id, 'NodeId'>;

/** 边唯一标识 */
export type EdgeId = Brand<Id, 'EdgeId'>;

/** 端点唯一标识 */
export type EndpointId = Brand<Id, 'EndpointId'>;

/** 图唯一标识 */
export type GraphId = Brand<Id, 'GraphId'>;

/**
 * 创建节点 ID
 *
 * @param id - 原始字符串
 * @returns 品牌化的节点 ID
 */
export function createNodeId(id: string): NodeId {
    return id as NodeId;
}

/**
 * 创建边 ID
 *
 * @param id - 原始字符串
 * @returns 品牌化的边 ID
 */
export function createEdgeId(id: string): EdgeId {
    return id as EdgeId;
}

/**
 * 创建端点 ID
 *
 * @param id - 原始字符串
 * @returns 品牌化的端点 ID
 */
export function createEndpointId(id: string): EndpointId {
    return id as EndpointId;
}

/**
 * 创建图 ID
 *
 * @param id - 原始字符串
 * @returns 品牌化的图 ID
 */
export function createGraphId(id: string): GraphId {
    return id as GraphId;
}
