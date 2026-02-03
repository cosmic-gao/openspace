import type { Plugin } from 'vite';
import type { RouteTree } from '@pathe/core';

/**
 * 上下文
 */
export interface Context {
    /** 目录 */
    readonly dir: string;
    /** 树 */
    tree: RouteTree | null;
    /** 就绪 */
    ready: boolean;
}

/**
 * 生成器
 */
export type Generate = (tree: RouteTree) => string;

/**
 * 定义
 */
export interface Definition {
    /** 标识 */
    readonly id: string;
    /** 生成 */
    readonly generate: Generate;
}

/**
 * 选项
 */
export interface Options {
    /** 目录 */
    readonly dir?: string;
    /** 忽略 */
    readonly ignore?: string[];
}

/**
 * 定义
 */
export function define(name: string, def: Definition) {
    return function plugin(options: Options = {}): Plugin {
        const dir = options.dir ?? 'app';
        const virtual = def.id;
        const resolved = '\0' + virtual;

        const ctx: Context = {
            dir,
            tree: null,
            ready: false,
        };

        return {
            name: `pathe:${name}`,

            resolveId(id) {
                if (id === virtual) {
                    return resolved;
                }
                return null;
            },

            async load(id) {
                if (id !== resolved) return null;

                const { createScanner } = await import('@pathe/core');

                if (!ctx.tree) {
                    const scanner = createScanner({
                        ignore: options.ignore,
                    });
                    ctx.tree = await scanner.scan(dir);
                    ctx.ready = true;
                }

                return def.generate(ctx.tree);
            },

            configureServer(server) {
                server.watcher.add(dir);

                server.watcher.on('all', async (event, path) => {
                    if (!path.startsWith(dir)) return;
                    if (!['add', 'unlink', 'change'].includes(event)) return;

                    const { createScanner } = await import('@pathe/core');
                    const scanner = createScanner({
                        ignore: options.ignore,
                    });
                    ctx.tree = await scanner.scan(dir);

                    const mod = server.moduleGraph.getModuleById(resolved);
                    if (mod) {
                        server.moduleGraph.invalidateModule(mod);
                        server.ws.send({ type: 'full-reload' });
                    }
                });
            },
        };
    };
}
