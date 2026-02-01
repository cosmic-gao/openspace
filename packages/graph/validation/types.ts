/**
 * @fileoverview 校验系统类型定义
 */

import type { Edge, Graph, Node } from '../types/entities';
import type { GraphSchema } from '../types/schema';

// ============================================================================
// 校验结果类型
// ============================================================================

/** 校验严重级别 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * 校验问题 - 描述一个具体的校验错误或警告
 */
export interface ValidationIssue {
    /** 严重级别 */
    readonly severity: ValidationSeverity;
    /** 问题代码（用于程序化处理） */
    readonly code: string;
    /** 人类可读的消息 */
    readonly message: string;
    /** 问题所在路径 */
    readonly path: readonly string[];
    /** 附加上下文信息 */
    readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * 校验结果
 */
export interface ValidationResult {
    /** 是否通过校验（无 error 级别问题） */
    readonly isValid: boolean;
    /** 所有问题列表 */
    readonly issues: readonly ValidationIssue[];
}

// ============================================================================
// 校验规则
// ============================================================================

/**
 * 校验上下文 - 提供校验所需的环境信息
 */
export interface ValidationContext {
    /** 被校验的图 */
    readonly graph: Graph;
    /** 图的 Schema */
    readonly schema: GraphSchema;
    /** 校验选项 */
    readonly options: ValidationOptions;
}

/**
 * 校验规则接口
 *
 * @template T - 校验目标类型
 */
export interface ValidationRule<T = unknown> {
    /** 规则唯一代码 */
    readonly code: string;
    /** 规则描述 */
    readonly description: string;
    /** 默认严重级别 */
    readonly severity: ValidationSeverity;
    /**
     * 执行校验
     * @param target - 校验目标
     * @param context - 校验上下文
     * @returns 发现的问题列表
     */
    validate(target: T, context: ValidationContext): ValidationIssue[];
}

/** 图级别校验规则 */
export type GraphValidationRule = ValidationRule<Graph>;

/** 节点级别校验规则 */
export type NodeValidationRule = ValidationRule<Node>;

/** 边级别校验规则 */
export type EdgeValidationRule = ValidationRule<Edge>;

// ============================================================================
// 校验选项
// ============================================================================

/**
 * 校验选项
 */
export interface ValidationOptions {
    /** 是否检查 Schema 约束 */
    readonly checkSchema?: boolean;
    /** 是否检查连接完整性 */
    readonly checkConnectivity?: boolean;
    /** 是否检查循环依赖（仅对 DAG 有效） */
    readonly checkCycles?: boolean;
    /** 是否检查端点基数 */
    readonly checkCardinality?: boolean;
    /** 是否检查数据类型兼容性 */
    readonly checkDataTypes?: boolean;
    /** 额外的图级别规则 */
    readonly graphRules?: readonly GraphValidationRule[];
    /** 额外的节点级别规则 */
    readonly nodeRules?: readonly NodeValidationRule[];
    /** 额外的边级别规则 */
    readonly edgeRules?: readonly EdgeValidationRule[];
}

/**
 * 默认校验选项
 */
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
    checkSchema: true,
    checkConnectivity: true,
    checkCycles: false,
    checkCardinality: true,
    checkDataTypes: true,
};
