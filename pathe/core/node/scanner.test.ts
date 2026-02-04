import { describe, it, expect } from 'vitest';
import { createScanner } from './scanner';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('RouteScanner', () => {
    const scanner = createScanner();
    const testDir = join(tmpdir(), 'routing-test-' + Date.now());

    // Helper to create file structure
    async function createFiles(structure: Record<string, string[]>) {
        await mkdir(testDir, { recursive: true });
        for (const [dir, files] of Object.entries(structure)) {
            const dirPath = join(testDir, dir);
            await mkdir(dirPath, { recursive: true });
            for (const file of files) {
                await writeFile(join(dirPath, file), '');
            }
        }
    }

    it('should scan simple routes', async () => {
        await createFiles({
            '': ['page.tsx'],
            'blog': ['page.tsx'],
        });

        const tree = await scanner.scan(testDir);

        expect(tree.root.components.page).toBeDefined();
        expect(tree.root.children).toHaveLength(1);
        expect(tree.root.children[0]?.segment.raw).toBe('blog');
        expect(tree.root.children[0]?.components.page).toBeDefined();

        await rm(testDir, { recursive: true, force: true });
    });

    it('should handle groups and dynamic segments', async () => {
        const dir = join(testDir, 'group-test');
        await createFiles({
            'group-test': [],
            'group-test/(auth)': [],
            'group-test/(auth)/login': ['page.tsx'],
        });

        // recreate scanner or just scan subpath
        const tree = await scanner.scan(dir);

        // root -> (auth) -> login
        const groupNode = tree.root.children.find(c => c.segment.type === 'group');
        expect(groupNode).toBeDefined();
        expect(groupNode?.segment.name).toBe('auth');

        const loginNode = groupNode?.children[0];
        expect(loginNode?.segment.raw).toBe('login');
        expect(loginNode?.components.page).toBeDefined();

        await rm(testDir, { recursive: true, force: true });
    });

    it('should scan nextjs 16 metadata files', async () => {
        const dir = join(testDir, 'meta-test');
        await createFiles({
            'meta-test': [
                'sitemap.xml',
                'robots.txt',
                'favicon.ico',
                'manifest.json',
                'opengraph-image.png',
            ],
        });

        const tree = await scanner.scan(dir);

        expect(tree.root.components.sitemap).toBeDefined();
        expect(tree.root.components.robots).toBeDefined();
        expect(tree.root.components.favicon).toBeDefined();
        expect(tree.root.components.manifest).toBeDefined();
        // 因为类型系统推断，这里可能需要 as any 或者确保类型定义已更新
        expect((tree.root.components as any)['opengraph-image']).toBeDefined();

        await rm(testDir, { recursive: true, force: true });
    });
});
