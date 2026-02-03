import {
    createScanner,
    createSorter,
    createCollector,
    createValidator,
    generatePath
} from '../index';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

console.log('=== Pathe 示例 ===\n');

// 创建扫描器
const scanner = createScanner({
    convention: {
        files: ['page', 'layout', 'middleware'],
        extensions: ['.tsx', '.ts'],
    },
});

// 创建排序器
const sorter = createSorter();

// 创建静态参数收集器
const collector = createCollector();

// 创建验证器
const validator = createValidator();

async function run() {
    // 1. 扫描路由目录
    // 1. 扫描路由目录
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const routesDir = join(__dirname, 'routes');
    console.log(`1. 扫描路由目录: ${routesDir}...`);
    const tree = await scanner.scan(routesDir);
    console.log('扫描完成，根节点子节点数:', tree.root.children.length);

    // 2. 验证路由冲突
    console.log('\n2. 验证路由冲突...');
    const validation = validator.validate(tree);
    console.log('验证结果:', validation.valid ? '✅ 无冲突' : `❌ ${validation.errors.length} 个冲突`);

    // 3. 排序路由树
    console.log('\n3. 排序路由树...');
    const sortedTree = { root: sorter.arrange(tree.root) };
    console.log('排序后子节点顺序:', sortedTree.root.children.map(c => c.segment.raw).join(', '));

    // 4. 收集动态路由
    console.log('\n4. 收集动态路由...');
    const dynamicRoutes = collector.collect(sortedTree);
    console.log(`找到 ${dynamicRoutes.length} 个动态路由:`);
    for (const route of dynamicRoutes) {
        console.log(`  - ${route.pattern} (参数: ${route.paramNames.join(', ')})`);
    }

    // 5. 生成静态路径示例
    console.log('\n5. 生成静态路径示例...');
    if (dynamicRoutes.length > 0) {
        const exampleRoute = dynamicRoutes[0]!;
        const exampleParams: Record<string, string> = {};
        for (const name of exampleRoute.paramNames) {
            exampleParams[name] = 'example-value';
        }
        const path = generatePath(exampleRoute.pattern, exampleParams);
        console.log(`  模式: ${exampleRoute.pattern}`);
        console.log(`  参数: ${JSON.stringify(exampleParams)}`);
        console.log(`  路径: ${path}`);
    }

    // 6. 检查中间件
    console.log('\n6. 检查中间件...');
    const nodesWithMiddleware: string[] = [];
    function findMiddleware(node: typeof tree.root, path: string = '') {
        const currentPath = path + (node.segment.raw ? `/${node.segment.raw}` : '');
        if (node.middleware) {
            nodesWithMiddleware.push(currentPath || '/');
        }
        for (const child of node.children) {
            findMiddleware(child, currentPath);
        }
    }
    findMiddleware(sortedTree.root);
    console.log(`找到 ${nodesWithMiddleware.length} 个中间件:`, nodesWithMiddleware.join(', ') || '无');

    // 7. 输出完整路由树
    console.log('\n7. 完整路由树:');
    console.log(JSON.stringify(sortedTree, null, 2));

    // 8. 模拟框架行为：加载元数据和中间件
    console.log('\n8. [模拟] 加载页面元数据与中间件...');

    // 辅助函数：递归处理树节点
    async function inspectNode(node: typeof tree.root, path: string = '') {
        const currentPath = path + (node.segment.raw ? `/${node.segment.raw}` : '');

        // 检查页面元数据
        if (node.components.page) {
            try {
                // 动态导入文件 (使用 fileURL 兼容 Windows)
                const fileUrl = pathToFileURL(node.components.page).href;
                const module = await import(fileUrl);
                if (module.metadata) {
                    console.log(`[Metadata] ${currentPath || '/'}:`, JSON.stringify(module.metadata));
                }
            } catch (e) {
                console.warn(`无法加载页面: ${node.components.page}`);
            }
        }

        // 检查中间件配置
        if (node.middleware) {
            try {
                const fileUrl = pathToFileURL(node.middleware).href;
                const module = await import(fileUrl);
                if (module.config) {
                    console.log(`[Middleware] ${currentPath || '/'} Config:`, JSON.stringify(module.config));
                }
            } catch (e) {
                console.warn(`无法加载中间件: ${node.middleware}`);
            }
        }

        for (const child of node.children) {
            await inspectNode(child, currentPath);
        }
    }

    await inspectNode(sortedTree.root);
}

run().catch(console.error);
