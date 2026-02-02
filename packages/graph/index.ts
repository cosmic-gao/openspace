/**
 * @openspace/graph
 *
 * 平台级、领域无关、可扩展的 Graph 元模型核心库
 *
 * @packageDocumentation
 */

// ============================================================================
// 类型导出
// ============================================================================

export type {
    // 标识类型
    GraphId,
    NodeId,
    EdgeId,
    EndpointId,
    EndpointRef,
} from './types/identity';

export {
    // ID 工厂函数
    createGraphId,
    createNodeId,
    createEdgeId,
    createEndpointId,
    createConnection,
    // ID 工具函数
    endpointRefEquals,
    endpointRefToString,
    parseEndpointRef,
} from './types/identity';

export type {
    // Schema 类型
    DataTypeDescriptor,
    Cardinality,
    CardinalityRange,
    EndpointDirection,
    EndpointSchema,
    EndpointDefinitions,
    NodeSchema,
    EdgeSchema,
    EndpointTypeConstraint,
    GraphSchema,
    // Schema 工具类型
    InferNodeData,
    InferEdgeData,
    InferEndpointData,
    InferEndpointIds,
} from './types/schema';

export type {
    // 实体类型
    BaseMetadata,
    Endpoint,
    CreateEndpointParams,
    Node,
    CreateNodeParams,
    Edge,
    CreateEdgeParams,
    GraphMetadata,
    Graph,
    CreateGraphParams,
} from './types/entities';

export {
    // 实体工厂函数
    createBaseMetadata,
    updateMetadata,
    createEndpoint,
    createGraph,
    // 类型守卫
    isNode,
    isEdge,
    isGraph,
} from './types/entities';

// ============================================================================
// 构建器导出
// ============================================================================

export type {
    AddNodeParams,
    AddEdgeParams,
    ConnectParams,
} from './builder/graph-builder';

export { GraphBuilder, createBuilder } from './builder/graph-builder';

// ============================================================================
// 校验导出
// ============================================================================

export type {
    ValidationSeverity,
    ValidationIssue,
    ValidationResult,
    ValidationContext,
    ValidationRule,
    GraphValidationRule,
    NodeValidationRule,
    EdgeValidationRule,
    ValidationOptions,
} from './validation/types';

export { DEFAULT_VALIDATION_OPTIONS } from './validation/types';

export {
    // 内置规则
    orphanNodeRule,
    edgeIntegrityRule,
    nodeTypeRule,
    endpointCardinalityRule,
    edgeTypeRule,
    edgeDirectionRule,
    builtinGraphRules,
    builtinNodeRules,
    builtinEdgeRules,
} from './validation/rules';

export { GraphValidator, createValidator } from './validation/validator';

// ============================================================================
// Diff 导出
// ============================================================================

export type {
    ChangeOperation,
    ChangeTarget,
    Change,
    ChangeSet,
    DiffSummary,
    DiffResult,
    GraphSnapshot,
    DiffOptions,
} from './diff/types';

export { DEFAULT_DIFF_OPTIONS } from './diff/types';

export { GraphDiffer, createDiffer } from './diff/differ';

// ============================================================================
// 查询导出
// ============================================================================

export type {
    NodeFilter,
    EdgeFilter,
    TraversalDirection,
    TraversalOptions,
    QueryResult,
    TraversalPath,
    SubgraphOptions,
    TopologicalSortResult,
} from './query/types';

export { DEFAULT_TRAVERSAL_OPTIONS } from './query/types';

export { GraphTraverser, createTraverser } from './query/traverser';
