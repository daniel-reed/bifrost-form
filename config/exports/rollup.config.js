const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');

export default {
    input: 'build/module/index.js',
    external: [
        'react',
        'react-dom'
    ],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**',
            presets: [
                ["@babel/preset-env", {"modules": false}]
            ],
        }),
    ],
    output: {
        globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
        },
        sourcemap: true,
    }
}