import type { EdgeId } from './id';
import type { Socket } from './socket';

/**
 * 边接口
 *
 * 边连接两个端点，承载节点间的关系语义。
 * 通过插槽实现与节点的解耦。
 *
 * @example
 * ```typescript
 * const edge: Edge = {
 *   id: 'edge-1' as EdgeId,
 *   source: { nodeId: 'node-1' as NodeId, endpointId: 'ep-2' as EndpointId },
 *   target: { nodeId: 'node-2' as NodeId, endpointId: 'ep-1' as EndpointId },
 * };
 * ```
 */
export interface Edge {
    /** 边唯一标识 */
    readonly id: EdgeId;

    /** 源插槽 */
    readonly source: Socket;

    /** 目标插槽 */
    readonly target: Socket;

    /** 扩展元数据 */
    readonly metadata?: Record<string, unknown>;
}
