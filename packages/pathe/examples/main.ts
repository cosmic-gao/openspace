import { createScanner, type RouteFile } from '../index';

console.log('Pathe Bun Example Loaded');

// 定义自定义文件类型
type CustomFile = RouteFile | 'meta';

// 使用泛型创建支持自定义文件类型的扫描器
const scanner = createScanner<CustomFile>({
    convention: {
        files: ['page', 'layout', 'meta'],
        extensions: ['.tsx', '.ts']
    }
});
console.log('Scanner created with custom convention');

async function run() {
    console.log('Scanning examples/routes directory...');
    const result = await scanner.scan('examples/routes');
    console.log('Scan result:', JSON.stringify(result, null, 2));
}

run().catch(console.error);
