import type { RouteNode, RouteTree, Segment } from '../types';

/**
 * 验证错误类型
 */
export type ValidationErrorType =
    | 'DUPLICATE_STATIC'      // 重复静态段
    | 'MULTIPLE_DYNAMIC'      // 同级多个动态段
    | 'DYNAMIC_CATCH_CONFLICT' // 动态段与 catch-all 冲突
    | 'MULTIPLE_CATCH_ALL';   // 同级多个 catch-all

/**
 * 验证错误接口
 */
export interface ValidationError {
    /** 错误类型 */
    readonly type: ValidationErrorType;
    /** 错误消息 */
    readonly message: string;
    /** 冲突路径 */
    readonly path: string;
    /** 冲突的段 */
    readonly segments: readonly Segment[];
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
    /** 是否通过验证 */
    readonly valid: boolean;
    /** 错误列表 */
    readonly errors: readonly ValidationError[];
}

/**
 * 路由验证器接口
 */
export interface RouteValidator {
    /**
     * 验证路由树
     *
     * @param tree - 路由树
     * @returns 验证结果
     */
    validate(tree: RouteTree): ValidationResult;
}

/**
 * 创建路由验证器
 *
 * @example
 * ```typescript
 * const validator = createValidator();
 * const result = validator.validate(tree);
 * if (!result.valid) {
 *   console.error('Route conflicts:', result.errors);
 * }
 * ```
 */
export function createValidator(): RouteValidator {
    const validateNode = (node: RouteNode, path: string): ValidationError[] => {
        const errors: ValidationError[] = [];
        const currentPath = path + (node.segment.raw ? `/${node.segment.raw}` : '');

        // 按类型分组子节点
        const staticSegments: Segment[] = [];
        const dynamicSegments: Segment[] = [];
        const catchAllSegments: Segment[] = [];
        const optionalCatchAllSegments: Segment[] = [];

        for (const child of node.children) {
            switch (child.segment.type) {
                case 'static':
                    staticSegments.push(child.segment);
                    break;
                case 'dynamic':
                    dynamicSegments.push(child.segment);
                    break;
                case 'catchAll':
                    catchAllSegments.push(child.segment);
                    break;
                case 'optionalCatchAll':
                    optionalCatchAllSegments.push(child.segment);
                    break;
            }
        }

        // 检查重复静态段
        const staticNames = staticSegments.map(s => s.raw);
        const duplicateStatic = staticNames.filter((name, index) => staticNames.indexOf(name) !== index);
        if (duplicateStatic.length > 0) {
            errors.push({
                type: 'DUPLICATE_STATIC',
                message: `Duplicate static segments: ${duplicateStatic.join(', ')}`,
                path: currentPath,
                segments: staticSegments.filter(s => duplicateStatic.includes(s.raw)),
            });
        }

        // 检查同级多个动态段
        if (dynamicSegments.length > 1) {
            errors.push({
                type: 'MULTIPLE_DYNAMIC',
                message: `Multiple dynamic segments at same level: ${dynamicSegments.map(s => s.raw).join(', ')}`,
                path: currentPath,
                segments: dynamicSegments,
            });
        }

        // 检查动态段与 catch-all 冲突
        if (dynamicSegments.length > 0 && (catchAllSegments.length > 0 || optionalCatchAllSegments.length > 0)) {
            errors.push({
                type: 'DYNAMIC_CATCH_CONFLICT',
                message: 'Dynamic segment conflicts with catch-all segment',
                path: currentPath,
                segments: [...dynamicSegments, ...catchAllSegments, ...optionalCatchAllSegments],
            });
        }

        // 检查同级多个 catch-all
        const allCatchAll = [...catchAllSegments, ...optionalCatchAllSegments];
        if (allCatchAll.length > 1) {
            errors.push({
                type: 'MULTIPLE_CATCH_ALL',
                message: `Multiple catch-all segments: ${allCatchAll.map(s => s.raw).join(', ')}`,
                path: currentPath,
                segments: allCatchAll,
            });
        }

        // 递归验证子节点
        for (const child of node.children) {
            errors.push(...validateNode(child, currentPath));
        }

        // 验证并行路由插槽
        if (node.slots) {
            for (const [slotName, slotNode] of Object.entries(node.slots)) {
                errors.push(...validateNode(slotNode, `${currentPath}/@${slotName}`));
            }
        }

        // 验证拦截路由
        if (node.intercepts) {
            for (const interceptNode of node.intercepts) {
                errors.push(...validateNode(interceptNode, currentPath));
            }
        }

        return errors;
    }

    return {
        validate(tree: RouteTree): ValidationResult {
            const errors = validateNode(tree.root, '');
            return {
                valid: errors.length === 0,
                errors,
            };
        },
    };
}
