/// <reference types="vite/client" />
/// <reference types="vue-router" />

declare module 'virtual:routing/routes' {
    import type { RouteRecordRaw } from 'vue-router';
    const routes: RouteRecordRaw[];
    export default routes;
}
