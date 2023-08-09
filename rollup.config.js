import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

const config = [
    {
        input: 'dist/index.js',
        output: [
            {
                file: 'index.js',
                format: 'cjs',
                sourcemap: true,
            }, {
                file: 'index.mjs',
                format: 'esm',
                sourcemap: true,
            },
        ],
        // external: ['os', 'url'],
        plugins: [typescript()]
    },
    {
        input: 'dist/index.d.ts',
        output: {
            file: 'index.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
]; 

export default config;