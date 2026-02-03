/// <reference types="vite/client" />

declare module 'virtual:pathe/routes' {
    import type { RouteObject } from 'react-router';
    const routes: RouteObject[];
    export default routes;
}
