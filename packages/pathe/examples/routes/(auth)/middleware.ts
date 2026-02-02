/**
 * 认证区中间件
 *
 * 仅对 (auth) 分组下的路由生效
 */

export function middleware(request: Request) {
    console.log('[Auth Middleware] Checking authentication...');
    return null;
}
