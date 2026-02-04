import type { Plugin } from 'vite';
import type { RouteTree } from '@routing/core';
import { define, type Options } from '@routing/vite';
import { adapt, type Options as AdaptOptions, type Route } from './adapter.ts';

/**
 * 选项
 */
export interface ReactOptions extends Options, AdaptOptions { }

/**
 * 编译
 */
const compile = (routes: readonly Route[]): string => {
    const imports: string[] = [];
    let count = 0;

    const map = (route: Route): string => {
        const parts: string[] = [];

        parts.push(`path: ${JSON.stringify(route.path)}`);

        if (route.index) {
            parts.push('index: true');
        }

        // 处理 Component (Lazy Load)
        if (route.Component) {
            const name = `_c${count++}`;
            const path = route.Component as string;
            // React Lazy
            imports.push(`const ${name} = React.lazy(() => import('${path}'));`);
            parts.push(`Component: ${name}`);
        }

        if (route.children?.length) {
            const children = route.children.map(map).join(',\n');
            parts.push(`children: [\n${children}\n]`);
        }

        if (route.handle) {
            parts.push(`handle: ${JSON.stringify(route.handle)}`);
        }

        return `{ ${parts.join(', ')} }`;
    };

    const code = routes.map(map).join(',\n');

    return [
        `import React from 'react';`,
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
 * 插件
 */
export function routing(options: ReactOptions = {}): Plugin {
    const factory = define('react', {
        id: 'virtual:routing/routes',
        generate: (tree) => generate(tree, options),
    });

    return factory(options);
}
