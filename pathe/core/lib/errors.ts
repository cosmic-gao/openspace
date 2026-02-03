/**
 * 错误码枚举
 */
export const enum PatheErrorCode {
    // Parser Errors
    INVALID_SEGMENT = 'INVALID_SEGMENT',

    // Scanner Errors
    SCAN_FAILED = 'SCAN_FAILED',

    // Validator Errors
    DUPLICATE_STATIC = 'DUPLICATE_STATIC',
    MULTIPLE_DYNAMIC = 'MULTIPLE_DYNAMIC',
    DYNAMIC_CATCH_CONFLICT = 'DYNAMIC_CATCH_CONFLICT',
    MULTIPLE_CATCH_ALL = 'MULTIPLE_CATCH_ALL',
    INVALID_SLOT_STRUCTURE = 'INVALID_SLOT_STRUCTURE',
    INVALID_INTERCEPT_STRUCTURE = 'INVALID_INTERCEPT_STRUCTURE',
    ORPHAN_MIDDLEWARE = 'ORPHAN_MIDDLEWARE',

    // Static Gen Errors
    MISSING_PARAM = 'MISSING_PARAM',
    EMPTY_CATCH_ALL = 'EMPTY_CATCH_ALL',
}

/**
 * Pathe 错误类
 */
export class PatheError extends Error {
    public readonly code: PatheErrorCode;
    public readonly context?: unknown;

    constructor(code: PatheErrorCode, message: string, context?: unknown) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'PatheError';

        // 恢复原型链 (针对 ES5 target)
        Object.setPrototypeOf(this, PatheError.prototype);
    }
}

/**
 * 创建错误辅助函数
 * 
 * @param code - 错误码
 * @param message - 错误消息
 * @param context -虽然上下文
 */
export function createError(code: PatheErrorCode, message: string, context?: unknown): PatheError {
    return new PatheError(code, message, context);
}
