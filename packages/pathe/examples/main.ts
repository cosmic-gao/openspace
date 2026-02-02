import {
    createScanner,
    createSorter,
    createCollector,
    createValidator,
    generatePath,
    type RouteFile,
} from '../index';

console.log('=== Pathe 示例 ===\n');

// 定义自定义文件类型
type CustomFile = RouteFile | 'meta';

// 创建扫描器（支持自定义文件类型）
const scanner = createScanner<CustomFile>({
    convention: {
        files: ['page', 'layout', 'meta', 'middleware', 'metadata'],
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
    console.log('1. 扫描路由目录...');
    const tree = await scanner.scan('examples/routes');
    console.log('扫描完成，根节点子节点数:', tree.root.children.length);

    // 2. 验证路由冲突
    console.log('\n2. 验证路由冲突...');
    const validation = validator.validate(tree);
    console.log('验证结果:', validation.valid ? '✅ 无冲突' : `❌ ${validation.errors.length} 个冲突`);

    // 3. 排序路由树
    console.log('\n3. 排序路由树...');
    const sortedTree = { root: sorter.sortTree(tree.root) };
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
}

run().catch(console.error);
