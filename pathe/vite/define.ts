import type { Plugin } from 'vite';
import type { RouteTree } from '@pathe/core';
import * as path from 'node:path';

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
                const root = server.config.root;
                // 确保 dir 是绝对路径，以匹配 watcher 的输出
                const absDir = path.resolve(root, dir);

                server.watcher.add(absDir);

                server.watcher.on('all', async (event, file) => {
                    // Windows 下路径可能是反斜杠，甚至 watcher 返回的格式可能不一致
                    // 最好统一 normalize，但简单起见先转绝对路径比较
                    // Vite watcher 通常返回系统相关的绝对路径
                    if (!file.startsWith(absDir)) return;

                    // 只监听结构性变化，忽略文件内容修改
                    if (!['add', 'unlink'].includes(event)) return;

                    const { createScanner } = await import('@pathe/core');
                    const scanner = createScanner({
                        ignore: options.ignore,
                    });

                    // 重新扫描
                    ctx.tree = await scanner.scan(dir);

                    const mod = server.moduleGraph.getModuleById(resolved);
                    if (mod) {
                        server.moduleGraph.invalidateModule(mod);
                    }
                });
            },
        };
    };
}
