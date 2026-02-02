import type { EdgeId, GraphId, NodeId } from './id';
import type { Node } from './node';
import type { Edge } from './edge';

/**
 * 图接口
 *
 * 图是顶层容器，持有所有节点和边。
 * 通过 type 字段区分不同图类型（Dependency / Dataflow / Knowledge / Process 等）。
 *
 * @example
 * ```typescript
 * const graph: Graph = {
 *   id: 'graph-1' as GraphId,
 *   type: 'dataflow',
 *   nodes: new Map([['node-1', node1], ['node-2', node2]]),
 *   edges: new Map([['edge-1', edge1]]),
 * };
 * ```
 */
export interface Graph {
    /** 图唯一标识 */
    readonly id: GraphId;

    /** 图类型，用于区分不同语义的图 */
    readonly type: string;

    /** 节点集合，键为节点 ID */
    readonly nodes: ReadonlyMap<NodeId, Node>;

    /** 边集合，键为边 ID */
    readonly edges: ReadonlyMap<EdgeId, Edge>;

    /** 扩展元数据 */
    readonly metadata?: Record<string, unknown>;
}
