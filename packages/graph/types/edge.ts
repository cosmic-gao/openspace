import type { EdgeId, EndpointId, NodeId } from './id';

/**
 * 连接器
 *
 * 用于在边定义中引用特定节点的特定端点。
 */
export interface Connector {
    /** 节点标识 */
    readonly nodeId: NodeId;

    /** 端点标识 */
    readonly endpointId: EndpointId;
}

/**
 * 边接口
 *
 * 边连接两个端点，承载节点间的关系语义。
 * 通过连接器实现与节点的解耦。
 *
 * @example
 * ```typescript
 * const edge: Edge = {
 *   id: 'edge-1',
 *   type: 'dataflow',
 *   source: { nodeId: 'node-1', endpointId: 'ep-2' },
 *   target: { nodeId: 'node-2', endpointId: 'ep-1' },
 * };
 * ```
 */
export interface Edge {
    /** 边唯一标识 */
    readonly id: EdgeId;

    /** 边类型，用于区分不同语义的边 */
    readonly type: string;

    /** 源连接器 */
    readonly source: Connector;

    /** 目标连接器 */
    readonly target: Connector;

    /** 扩展元数据 */
    readonly metadata?: Record<string, unknown>;
}
