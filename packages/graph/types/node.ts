import type { NodeId } from './id';
import type { Endpoint } from './endpoint';

/**
 * 节点接口
 *
 * 节点是图中的顶点，可携带多个端点，支持扩展元数据。
 *
 * @example
 * ```typescript
 * const node: Node = {
 *   id: 'node-1' as NodeId,
 *   type: 'process',
 *   endpoints: [
 *     { id: 'ep-1' as EndpointId, nodeId: 'node-1' as NodeId, direction: 'in', name: 'input' },
 *     { id: 'ep-2' as EndpointId, nodeId: 'node-1' as NodeId, direction: 'out', name: 'output' },
 *   ],
 * };
 * ```
 */
export interface Node {
    /** 节点唯一标识 */
    readonly id: NodeId;

    /** 节点类型，用于区分不同语义的节点 */
    readonly type: string;

    /** 节点携带的端点列表 */
    readonly endpoints: ReadonlyArray<Endpoint>;

    /** 扩展元数据 */
    readonly metadata?: Record<string, unknown>;
}
