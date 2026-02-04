import type { RouteNode, RouteTree, Segment } from '../types/index.ts';
import { RoutingErrorCode } from './errors.ts';

/**
 * 验证错误接口
 */
export interface ValidationError {
    /** 错误类型 */
    readonly type: RoutingErrorCode;
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
 * 内部助手：分组后的子节点段
 */
interface SegmentGroups {
    static: Segment[];
    dynamic: Segment[];
    catchAll: Segment[];
    optionalCatchAll: Segment[];
}

/**
 * 创建路由验证器
 */
export function createValidator(): RouteValidator {

    /**
     * 检查重复静态段
     */
    const checkDuplicates = (segments: Segment[], path: string): ValidationError[] => {
        const errors: ValidationError[] = [];
        const names = segments.map(s => s.raw);
        const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);

        if (duplicateNames.length > 0) {
            errors.push({
                type: RoutingErrorCode.DUPLICATE_STATIC,
                message: `Duplicate static segments: ${duplicateNames.join(', ')}`,
                path,
                segments: segments.filter(s => duplicateNames.includes(s.raw)),
            });
        }
        return errors;
    };

    /**
     * 检查动态段冲突
     */
    const checkConflicts = (groups: SegmentGroups, path: string): ValidationError[] => {
        const errors: ValidationError[] = [];

        // 检查同级多个动态段 (e.g. /[id] and /[slug])
        if (groups.dynamic.length > 1) {
            errors.push({
                type: RoutingErrorCode.MULTIPLE_DYNAMIC,
                message: `Multiple dynamic segments at same level: ${groups.dynamic.map(s => s.raw).join(', ')}`,
                path,
                segments: groups.dynamic,
            });
        }

        // 检查动态段与 catch-all 冲突
        const hasCatchAll = groups.catchAll.length > 0 || groups.optionalCatchAll.length > 0;
        if (groups.dynamic.length > 0 && hasCatchAll) {
            errors.push({
                type: RoutingErrorCode.DYNAMIC_CATCH_CONFLICT,
                message: 'Dynamic segment conflicts with catch-all segment',
                path,
                segments: [...groups.dynamic, ...groups.catchAll, ...groups.optionalCatchAll],
            });
        }

        return errors;
    };

    /**
     * 检查 Catch-all 冲突
     */
    const checkCatchAll = (groups: SegmentGroups, path: string): ValidationError[] => {
        const errors: ValidationError[] = [];
        const allCatchAll = [...groups.catchAll, ...groups.optionalCatchAll];

        if (allCatchAll.length > 1) {
            errors.push({
                type: RoutingErrorCode.MULTIPLE_CATCH_ALL,
                message: `Multiple catch-all segments: ${allCatchAll.map(s => s.raw).join(', ')}`,
                path,
                segments: allCatchAll,
            });
        }
        return errors;
    };

    /**
     * 递归检查子树中是否有 Page 组件
     */
    const hasPageInTree = (node: RouteNode): boolean => {
        if ('page' in node.components) return true;

        for (const child of node.children) {
            if (hasPageInTree(child)) return true;
        }

        if (node.slots) {
            for (const slotNode of Object.values(node.slots)) {
                if (hasPageInTree(slotNode)) return true;
            }
        }
        return false;
    };

    /**
     * 验证单个节点
     */
    const validateNode = (node: RouteNode, path: string): ValidationError[] => {
        const errors: ValidationError[] = [];
        const currentPath = path + (node.segment.raw ? `/${node.segment.raw}` : '');

        // 1. 分组子节点
        const groups: SegmentGroups = {
            static: [],
            dynamic: [],
            catchAll: [],
            optionalCatchAll: [],
        };

        for (const child of node.children) {
            switch (child.segment.type) {
                case 'static': groups.static.push(child.segment); break;
                case 'dynamic': groups.dynamic.push(child.segment); break;
                case 'catchAll': groups.catchAll.push(child.segment); break;
                case 'optionalCatchAll': groups.optionalCatchAll.push(child.segment); break;
            }
        }

        // 2. 执行同级检查
        errors.push(...checkDuplicates(groups.static, currentPath));
        errors.push(...checkConflicts(groups, currentPath));
        errors.push(...checkCatchAll(groups, currentPath));

        // 3. 递归验证子节点
        for (const child of node.children) {
            errors.push(...validateNode(child, currentPath));
        }

        // 4. 验证插槽结构
        if (node.slots) {
            for (const [slotName, slotNode] of Object.entries(node.slots)) {
                const slotPath = `${currentPath}/@${slotName}`;

                // 必须包含 page 或 default，或者子树中有 page
                const hasValidComponent = 'page' in slotNode.components || 'default' in slotNode.components;

                if (!hasValidComponent && !hasPageInTree(slotNode)) {
                    errors.push({
                        type: RoutingErrorCode.INVALID_SLOT_STRUCTURE,
                        message: `Parallel route slot '@${slotName}' must contain a 'page' or 'default' component`,
                        path: slotPath,
                        segments: [slotNode.segment],
                    });
                }

                errors.push(...validateNode(slotNode, slotPath));
            }
        }

        // 5. 验证拦截路由
        if (node.intercepts) {
            for (const interceptNode of node.intercepts) {
                const interceptPath = `${currentPath}/${interceptNode.segment.raw}`;

                // 必须直接包含 page 组件
                if (!('page' in interceptNode.components)) {
                    errors.push({
                        type: RoutingErrorCode.INVALID_INTERCEPT_STRUCTURE,
                        message: `Intercept route '${interceptNode.segment.raw}' must contain a 'page' component`,
                        path: interceptPath,
                        segments: [interceptNode.segment],
                    });
                }

                errors.push(...validateNode(interceptNode, currentPath));
            }
        }

        // 6. 验证中间件孤儿
        if (node.middleware) {
            const hasPage = 'page' in node.components || hasPageInTree(node);
            if (!hasPage) {
                errors.push({
                    type: RoutingErrorCode.ORPHAN_MIDDLEWARE,
                    message: `Middleware at '${currentPath || '/'}' has no associated page component`,
                    path: currentPath || '/',
                    segments: [node.segment],
                });
            }
        }

        return errors;
    };

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
