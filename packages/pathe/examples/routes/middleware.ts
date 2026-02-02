/**
 * 根级中间件示例
 *
 * 在真实应用中，此文件会被框架加载并在请求处理前执行。
 */

export function middleware(request: Request) {
    console.log('[Middleware] Request:', request.url);
    return null; // 继续处理请求
}

export const config = {
    matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
