import type { EndpointId, NodeId } from './id';
import type { Direction } from './direction';

/**
 * 端点接口
 *
 * 端点是节点的连接点（Port），定义连接的方向与约束。
 * 边通过端点连接节点，实现 Node 与 Edge 的解耦。
 *
 * @example
 * ```typescript
 * const inputEndpoint: Endpoint = {
 *   id: 'ep-1' as EndpointId,
 *   nodeId: 'node-1' as NodeId,
 *   direction: 'in',
 *   name: 'input',
 * };
 * ```
 */
export interface Endpoint {
    /** 端点唯一标识 */
    readonly id: EndpointId;

    /** 所属节点标识 */
    readonly nodeId: NodeId;

    /** 端点方向 */
    readonly direction: Direction;

    /** 端点名称 */
    readonly name: string;

    /** 扩展元数据 */
    readonly metadata?: Record<string, unknown>;
}
