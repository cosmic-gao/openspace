import type { EndpointId, NodeId } from './id';

/**
 * 插槽接口
 *
 * 用于在边定义中引用特定节点的特定端点。
 */
export interface Socket {
    /** 节点标识 */
    readonly nodeId: NodeId;

    /** 端点标识 */
    readonly endpointId: EndpointId;
}
