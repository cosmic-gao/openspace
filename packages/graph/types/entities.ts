/**
 * @fileoverview 实体类型定义
 * 定义 Endpoint、Node、Edge、Graph 的运行时实例类型
 */

import type {
    EdgeId,
    EndpointId,
    EndpointRef,
    GraphId,
    NodeId,
} from './identity';
import type {
    Cardinality,
    DataTypeDescriptor,
    EdgeSchema,
    EndpointDirection,
    EndpointSchema,
    NodeSchema,
} from './schema';

// ============================================================================
// 元数据
// ============================================================================

/**
 * 基础元数据 - 所有实体共享的元信息
 */
export interface BaseMetadata {
    /** 创建时间戳（毫秒） */
    readonly createdAt: number;
    /** 最后更新时间戳（毫秒） */
    readonly updatedAt: number;
    /** 版本号（用于乐观锁） */
    readonly version: number;
    /** 标签列表 */
    readonly tags?: readonly string[];
    /** 自定义注解 */
    readonly annotations?: Readonly<Record<string, unknown>>;
}

/**
 * 创建默认元数据
 */
export function createBaseMetadata(): BaseMetadata {
    const now = Date.now();
    return {
        createdAt: now,
        updatedAt: now,
        version: 1,
    };
}

/**
 * 更新元数据
 */
export function updateMetadata(metadata: BaseMetadata): BaseMetadata {
    return {
        ...metadata,
        updatedAt: Date.now(),
        version: metadata.version + 1,
    };
}

// ============================================================================
// 端点实体
// ============================================================================

/**
 * 端点实例 - 节点的输入/输出接口
 *
 * @template S - 端点 Schema 类型
 */
export interface Endpoint<S extends EndpointSchema = EndpointSchema> {
    /** 端点 ID（在节点内唯一） */
    readonly id: EndpointId;
    /** 端点类型标识 */
    readonly type: S['type'];
    /** 方向 */
    readonly direction: EndpointDirection;
    /** 数据类型描述 */
    readonly dataType: DataTypeDescriptor;
    /** 连接基数 */
    readonly cardinality: Cardinality;
    /** 已连接的边 ID 列表 */
    readonly connectedEdges: readonly EdgeId[];
    /** 端点附加数据 */
    readonly data?: S extends EndpointSchema<infer D> ? D : unknown;
}

/**
 * 创建端点实例的参数
 */
export interface CreateEndpointParams<S extends EndpointSchema = EndpointSchema> {
    id: EndpointId;
    schema: S;
    data?: S extends EndpointSchema<infer D> ? D : unknown;
}

/**
 * 从 Schema 创建端点实例
 */
export function createEndpoint<S extends EndpointSchema>(
    params: CreateEndpointParams<S>
): Endpoint<S> {
    const { id, schema, data } = params;
    return {
        id,
        type: schema.type as S['type'],
        direction: schema.direction,
        dataType: schema.dataType,
        cardinality: schema.cardinality,
        connectedEdges: [],
        data: data ?? schema.defaultData,
    } as Endpoint<S>;
}

// ============================================================================
// 节点实体
// ============================================================================

/**
 * 节点实例 - 图中的顶点
 *
 * @template S - 节点 Schema 类型
 */
export interface Node<S extends NodeSchema = NodeSchema> {
    /** 节点 ID（在图内唯一） */
    readonly id: NodeId;
    /** 节点类型标识 */
    readonly type: S['type'];
    /** 节点数据 */
    readonly data: S extends NodeSchema<infer D> ? D : unknown;
    /** 端点映射 */
    readonly endpoints: ReadonlyMap<EndpointId, Endpoint>;
    /** 元数据 */
    readonly metadata: BaseMetadata;
}

/**
 * 创建节点实例的参数
 */
export interface CreateNodeParams<S extends NodeSchema = NodeSchema> {
    id: NodeId;
    schema: S;
    data?: S extends NodeSchema<infer D> ? D : unknown;
    metadata?: Partial<BaseMetadata>;
}

// ============================================================================
// 边实体
// ============================================================================

/**
 * 边实例 - 连接两个端点
 *
 * @template S - 边 Schema 类型
 */
export interface Edge<S extends EdgeSchema = EdgeSchema> {
    /** 边 ID（在图内唯一） */
    readonly id: EdgeId;
    /** 边类型标识 */
    readonly type: S['type'];
    /** 边数据 */
    readonly data: S extends EdgeSchema<infer D> ? D : unknown;
    /** 源端点引用 */
    readonly source: EndpointRef;
    /** 目标端点引用 */
    readonly target: EndpointRef;
    /** 元数据 */
    readonly metadata: BaseMetadata;
}

/**
 * 创建边实例的参数
 */
export interface CreateEdgeParams<S extends EdgeSchema = EdgeSchema> {
    id: EdgeId;
    schema: S;
    source: EndpointRef;
    target: EndpointRef;
    data?: S extends EdgeSchema<infer D> ? D : unknown;
    metadata?: Partial<BaseMetadata>;
}

// ============================================================================
// 图实体
// ============================================================================

/**
 * 图元数据
 */
export interface GraphMetadata extends BaseMetadata {
    /** 图名称 */
    readonly name?: string;
    /** 图描述 */
    readonly description?: string;
    /** 关联的 Schema 名称 */
    readonly schemaName: string;
    /** 关联的 Schema 版本 */
    readonly schemaVersion: string;
}

/**
 * 图实例 - 节点和边的容器
 *
 * @template NS - 节点 Schema 类型
 * @template ES - 边 Schema 类型
 */
export interface Graph<
    NS extends NodeSchema = NodeSchema,
    ES extends EdgeSchema = EdgeSchema
> {
    /** 图 ID */
    readonly id: GraphId;
    /** 节点映射 */
    readonly nodes: ReadonlyMap<NodeId, Node<NS>>;
    /** 边映射 */
    readonly edges: ReadonlyMap<EdgeId, Edge<ES>>;
    /** 图元数据 */
    readonly metadata: GraphMetadata;
}

/**
 * 创建空图的参数
 */
export interface CreateGraphParams {
    id: GraphId;
    schemaName: string;
    schemaVersion: string;
    name?: string;
    description?: string;
}

/**
 * 创建空图实例
 */
export function createGraph<
    NS extends NodeSchema = NodeSchema,
    ES extends EdgeSchema = EdgeSchema
>(params: CreateGraphParams): Graph<NS, ES> {
    const now = Date.now();
    return {
        id: params.id,
        nodes: new Map(),
        edges: new Map(),
        metadata: {
            createdAt: now,
            updatedAt: now,
            version: 1,
            name: params.name,
            description: params.description,
            schemaName: params.schemaName,
            schemaVersion: params.schemaVersion,
        },
    };
}

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 检查对象是否为 Node 实例
 */
export function isNode(obj: unknown): obj is Node {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'type' in obj &&
        'endpoints' in obj &&
        'metadata' in obj
    );
}

/**
 * 检查对象是否为 Edge 实例
 */
export function isEdge(obj: unknown): obj is Edge {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'type' in obj &&
        'source' in obj &&
        'target' in obj &&
        'metadata' in obj
    );
}

/**
 * 检查对象是否为 Graph 实例
 */
export function isGraph(obj: unknown): obj is Graph {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'nodes' in obj &&
        'edges' in obj &&
        'metadata' in obj
    );
}
