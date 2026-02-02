import { createScanner } from '../index';

console.log('Pathe Bun Example Loaded');

const scanner = createScanner({
    convention: {
        // @ts-expect-error - Demonstrating custom file convention extension
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
