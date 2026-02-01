/**
 * @fileoverview Schema 类型系统
 * 定义节点、边、端点的结构约束，支持运行时验证与扩展
 */

// ============================================================================
// 数据类型描述
// ============================================================================

/**
 * 数据类型描述符 - 描述端点可以传输的数据类型
 * 用于连接兼容性检查
 *
 * @example
 * // 基础类型
 * { type: 'string' }
 *
 * // 数组类型
 * { type: 'number', isArray: true }
 *
 * // 泛型类型
 * { type: 'Promise', typeParams: [{ type: 'string' }] }
 */
export interface DataTypeDescriptor {
    /** 类型标识符，如 "string", "number", "MyCustomType" */
    readonly type: string;
    /** 是否为数组类型 */
    readonly isArray?: boolean;
    /** 是否可空 */
    readonly nullable?: boolean;
    /** 泛型参数（用于复杂类型） */
    readonly typeParams?: readonly DataTypeDescriptor[];
    /** 扩展元信息 */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

// ============================================================================
// 连接约束
// ============================================================================

/**
 * 连接基数 - 定义端点可以连接的边数量
 */
export type Cardinality =
    | 'one'    // 单连接
    | 'many'   // 无限多连接
    | CardinalityRange; // 自定义范围

/** 基数范围 */
export interface CardinalityRange {
    readonly min: number;
    readonly max: number;
}

/** 端点方向 */
export type EndpointDirection = 'input' | 'output' | 'bidirectional';

// ============================================================================
// 端点 Schema
// ============================================================================

/**
 * 端点 Schema - 定义端点的结构约束
 *
 * @template TData - 端点附加数据类型
 */
export interface EndpointSchema<TData = unknown> {
    /** 端点类型标识 */
    readonly type: string;
    /** 方向 */
    readonly direction: EndpointDirection;
    /** 数据类型 */
    readonly dataType: DataTypeDescriptor;
    /** 连接基数 */
    readonly cardinality: Cardinality;
    /** 端点附加数据的默认值 */
    readonly defaultData?: TData;
    /** 端点描述 */
    readonly description?: string;
}

// ============================================================================
// 节点 Schema
// ============================================================================

/**
 * 端点定义映射
 */
export type EndpointDefinitions = Readonly<Record<string, EndpointSchema>>;

/**
 * 节点 Schema - 定义节点的结构约束
 *
 * @template TData - 节点数据类型
 * @template TEndpoints - 端点定义映射类型
 */
export interface NodeSchema<
    TData = unknown,
    TEndpoints extends EndpointDefinitions = EndpointDefinitions
> {
    /** 节点类型标识 */
    readonly type: string;
    /** 端点定义 */
    readonly endpoints: TEndpoints;
    /** 节点数据的默认值 */
    readonly defaultData?: TData;
    /** Schema 版本 */
    readonly version?: string;
    /** 节点描述 */
    readonly description?: string;
    /** 节点分类标签 */
    readonly category?: string;
    /** 节点图标 */
    readonly icon?: string;
}

// ============================================================================
// 边 Schema
// ============================================================================

/**
 * 端点类型约束 - 限制边可以连接的端点类型
 */
export interface EndpointTypeConstraint {
    /** 允许的节点类型 */
    readonly nodeTypes?: readonly string[];
    /** 允许的端点类型 */
    readonly endpointTypes?: readonly string[];
    /** 允许的方向 */
    readonly direction?: EndpointDirection;
    /** 允许的数据类型 */
    readonly dataTypes?: readonly string[];
}

/**
 * 边 Schema - 定义边的结构约束
 *
 * @template TData - 边数据类型
 */
export interface EdgeSchema<TData = unknown> {
    /** 边类型标识 */
    readonly type: string;
    /** 边数据的默认值 */
    readonly defaultData?: TData;
    /** 源端点约束 */
    readonly sourceConstraint?: EndpointTypeConstraint;
    /** 目标端点约束 */
    readonly targetConstraint?: EndpointTypeConstraint;
    /** 是否允许自环 */
    readonly allowSelfLoop?: boolean;
    /** 是否为有向边 */
    readonly directed?: boolean;
    /** 边描述 */
    readonly description?: string;
}

// ============================================================================
// 图 Schema
// ============================================================================

/**
 * 图 Schema - 聚合所有类型定义
 * 作为图的"蓝图"，定义允许的节点类型和边类型
 */
export interface GraphSchema<
    TNodeSchemas extends Record<string, NodeSchema> = Record<string, NodeSchema>,
    TEdgeSchemas extends Record<string, EdgeSchema> = Record<string, EdgeSchema>
> {
    /** Schema 名称 */
    readonly name: string;
    /** Schema 版本 */
    readonly version: string;
    /** 节点类型注册表 */
    readonly nodeTypes: TNodeSchemas;
    /** 边类型注册表 */
    readonly edgeTypes: TEdgeSchemas;
    /** Schema 描述 */
    readonly description?: string;
}

// ============================================================================
// Schema 工具类型
// ============================================================================

/**
 * 从 NodeSchema 提取数据类型
 */
export type InferNodeData<T extends NodeSchema> = T extends NodeSchema<infer D>
    ? D
    : never;

/**
 * 从 EdgeSchema 提取数据类型
 */
export type InferEdgeData<T extends EdgeSchema> = T extends EdgeSchema<infer D>
    ? D
    : never;

/**
 * 从 EndpointSchema 提取数据类型
 */
export type InferEndpointData<T extends EndpointSchema> =
    T extends EndpointSchema<infer D> ? D : never;

/**
 * 从 NodeSchema 提取端点 ID 联合类型
 */
export type InferEndpointIds<T extends NodeSchema> = T extends NodeSchema<
    unknown,
    infer E
>
    ? keyof E
    : never;
