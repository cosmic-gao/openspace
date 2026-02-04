/// <reference types="vite/client" />

declare module 'virtual:routing/routes' {
    import type { RouteObject } from 'react-router';
    const routes: RouteObject[];
    export default routes;
}
