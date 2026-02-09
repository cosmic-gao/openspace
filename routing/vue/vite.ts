import type { Plugin } from 'vite';
import type { RouteTree } from '@routing/core';
import { define, type Options } from '@routing/vite';
import { adapt, type Options as AdaptOptions, type Route } from './adapter.ts';
import { normalize } from 'pathe';

/**
 * 选项
 */
export interface VueOptions extends Options, AdaptOptions { }

/**
 * 编译
 */
const compile = (routes: readonly Route[]): string => {
    const imports: string[] = [];
    let count = 0;

    const map = (route: Route): string => {
        const parts: string[] = [];

        parts.push(`path: ${JSON.stringify(route.path)}`);

        if (route.component) {
            const name = `_c${count++}`;
            // 使用 pathe 规范化路径，添加前导斜杠
            const normalized = '/' + normalize(route.component as string);
            imports.push(`const ${name} = () => import('${normalized}');`);
            parts.push(`component: ${name}`);
        }

        if (route.children?.length) {
            const children = route.children.map(map).join(',\n');
            parts.push(`children: [\n${children}\n]`);
        }

        if (route.meta) {
            parts.push(`meta: ${JSON.stringify(route.meta)}`);
        }

        return `{ ${parts.join(', ')} }`;
    };

    const code = routes.map(map).join(',\n');

    return [
        ...imports,
        '',
        'export default [',
        code,
        '];'
    ].join('\n');
};

/**
 * 生成
 */
const generate = (tree: RouteTree, options: AdaptOptions): string => {
    return compile(adapt(tree, options));
};

/**
 * Vue 默认扩展名
 */
const VUE_EXTENSIONS = ['.vue', '.tsx', '.ts', '.jsx', '.js'] as const;

/**
 * 插件
 */
export function routing(options: VueOptions = {}): Plugin {
    const factory = define('vue', {
        id: 'virtual:routing/routes',
        generate: (tree) => generate(tree, options),
    });

    return factory({ extensions: VUE_EXTENSIONS, ...options });
}
