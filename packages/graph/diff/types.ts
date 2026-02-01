/**
 * @fileoverview Diff 系统类型定义
 */

import type { GraphId } from '../types/identity';

// ============================================================================
// 变更操作类型
// ============================================================================

/** 变更操作类型 */
export type ChangeOperation = 'add' | 'remove' | 'update';

/** 变更目标类型 */
export type ChangeTarget = 'node' | 'edge' | 'endpoint' | 'graph' | 'metadata';

// ============================================================================
// 变更记录
// ============================================================================

/**
 * 单个变更记录
 *
 * @template T - 变更值的类型
 */
export interface Change<T = unknown> {
    /** 操作类型 */
    readonly operation: ChangeOperation;
    /** 目标类型 */
    readonly target: ChangeTarget;
    /** 变更路径 */
    readonly path: readonly string[];
    /** 变更前的值（add 操作时为 undefined） */
    readonly oldValue?: T;
    /** 变更后的值（remove 操作时为 undefined） */
    readonly newValue?: T;
    /** 变更时间戳 */
    readonly timestamp: number;
}

/**
 * 变更集 - 一组相关的变更
 */
export interface ChangeSet {
    /** 变更集 ID */
    readonly id: string;
    /** 图 ID */
    readonly graphId: GraphId;
    /** 起始版本 */
    readonly fromVersion: number;
    /** 目标版本 */
    readonly toVersion: number;
    /** 变更列表 */
    readonly changes: readonly Change[];
    /** 创建时间 */
    readonly createdAt: number;
    /** 作者（可选） */
    readonly author?: string;
    /** 变更描述（可选） */
    readonly description?: string;
}

// ============================================================================
// Diff 结果
// ============================================================================

/**
 * Diff 结果摘要
 */
export interface DiffSummary {
    /** 新增的节点数 */
    readonly nodesAdded: number;
    /** 删除的节点数 */
    readonly nodesRemoved: number;
    /** 更新的节点数 */
    readonly nodesUpdated: number;
    /** 新增的边数 */
    readonly edgesAdded: number;
    /** 删除的边数 */
    readonly edgesRemoved: number;
    /** 更新的边数 */
    readonly edgesUpdated: number;
}

/**
 * Diff 结果
 */
export interface DiffResult {
    /** 变更集 */
    readonly changeSet: ChangeSet;
    /** 变更摘要 */
    readonly summary: DiffSummary;
    /** 是否有变更 */
    readonly hasChanges: boolean;
}

// ============================================================================
// 版本快照
// ============================================================================

/**
 * 图的版本快照
 */
export interface GraphSnapshot {
    /** 版本号 */
    readonly version: number;
    /** 图的序列化数据 */
    readonly data: unknown;
    /** 快照时间 */
    readonly timestamp: number;
    /** 校验和（用于完整性验证） */
    readonly checksum: string;
}

// ============================================================================
// Diff 选项
// ============================================================================

/**
 * Diff 选项
 */
export interface DiffOptions {
    /** 是否包含元数据变更 */
    readonly includeMetadata?: boolean;
    /** 是否深度比较数据 */
    readonly deepCompare?: boolean;
    /** 忽略的路径模式 */
    readonly ignorePaths?: readonly string[];
}

/**
 * 默认 Diff 选项
 */
export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
    includeMetadata: true,
    deepCompare: true,
};
