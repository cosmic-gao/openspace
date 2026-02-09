/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineSub } from './adapter';

describe('defineSub', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should return a Lifecycle object', () => {
        const lifecycle = defineSub({
            name: 'test-app',
            mount: vi.fn(),
            unmount: vi.fn(),
        });

        expect(lifecycle).toHaveProperty('bootstrap');
        expect(lifecycle).toHaveProperty('mount');
        expect(lifecycle).toHaveProperty('unmount');
    });

    it('should call mount with HTMLElement container', async () => {
        const mountFn = vi.fn();
        const lifecycle = defineSub({
            name: 'test-app',
            mount: mountFn,
            unmount: vi.fn(),
        });

        const app = {
            name: 'test-app',
            entry: 'http://localhost:3000',
            container,
            activeRule: '/test',
        };

        await lifecycle.mount?.(app, { foo: 'bar' });

        expect(mountFn).toHaveBeenCalledWith(container, { foo: 'bar' });
    });

    it('should call mount with string container selector', async () => {
        const mountFn = vi.fn();
        const lifecycle = defineSub({
            name: 'test-app',
            mount: mountFn,
            unmount: vi.fn(),
        });

        const app = {
            name: 'test-app',
            entry: 'http://localhost:3000',
            container: '#test-container',
            activeRule: '/test',
        };

        await lifecycle.mount?.(app, { foo: 'bar' });

        expect(mountFn).toHaveBeenCalledWith(container, { foo: 'bar' });
    });

    it('should call unmount', async () => {
        const unmountFn = vi.fn();
        const lifecycle = defineSub({
            name: 'test-app',
            mount: vi.fn(),
            unmount: unmountFn,
        });

        await lifecycle.unmount?.(
            { name: 'test', entry: '', container: '', activeRule: '' },
            {}
        );

        expect(unmountFn).toHaveBeenCalled();
    });

    it('should include update when provided', async () => {
        const updateFn = vi.fn();
        const lifecycle = defineSub({
            name: 'test-app',
            mount: vi.fn(),
            unmount: vi.fn(),
            update: updateFn,
        });

        expect(lifecycle.update).toBeDefined();

        await lifecycle.update?.(
            { name: 'test', entry: '', container: '', activeRule: '' },
            { key: 'value' }
        );

        expect(updateFn).toHaveBeenCalledWith({ key: 'value' });
    });

    it('should not include update when not provided', () => {
        const lifecycle = defineSub({
            name: 'test-app',
            mount: vi.fn(),
            unmount: vi.fn(),
        });

        expect(lifecycle.update).toBeUndefined();
    });
});
