import { describe, it, expect } from 'vitest';
import { define } from './adapter';

describe('define', () => {
    it('should create an adapt function', () => {
        const adapt = define({
            load: async () => 'loaded',
            lifecycle: (_ctx, _opts, loaded) => ({ result: loaded }),
        });

        expect(typeof adapt).toBe('function');
    });

    it('should execute load and lifecycle', async () => {
        const adapt = define({
            load: async (ctx) => `loaded:${ctx.name}`,
            lifecycle: (ctx, _opts, loaded) => ({
                name: ctx.name,
                loaded,
            }),
        });

        const result = await adapt(
            { name: 'test-app', entry: 'http://localhost:3000', container: '#app' },
            {}
        );

        expect(result).toEqual({
            name: 'test-app',
            loaded: 'loaded:test-app',
        });
    });

    it('should call sandbox when provided', async () => {
        let sandboxCalled = false;

        const adapt = define({
            load: async () => 'loaded',
            sandbox: () => {
                sandboxCalled = true;
                return {};
            },
            lifecycle: () => ({ done: true }),
        });

        await adapt(
            { name: 'test', entry: 'http://localhost:3000', container: '#app' },
            {}
        );

        expect(sandboxCalled).toBe(true);
    });

    it('should pass options to lifecycle', async () => {
        const adapt = define<{ options: unknown }, { custom: string }>({
            load: async () => null,
            lifecycle: (_ctx, opts) => ({ options: opts }),
        });

        const result = await adapt(
            { name: 'test', entry: 'http://localhost:3000', container: '#app' },
            { custom: 'value' }
        );

        expect(result.options).toEqual({ custom: 'value' });
    });
});
