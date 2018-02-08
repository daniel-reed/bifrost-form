const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');

export default {
    input: 'build/module/index.js',
    external: [
        'react', 'react-redux', 'prop-types', 'lodash'
    ],
    plugins: [
        resolve({
            browser: true,
        }),
        babel({
            exclude: 'node_modules/**',
            presets: [["env", {"modules": false}]],
            plugins: ["external-helpers"]
        }),
        commonjs()
    ],
    output: {
        sourcemap: true,
    }
}