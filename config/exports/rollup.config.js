import { nodeResolve } from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'

export default {
    input: 'build/module/index.js',
    external: [
        'react',
        'react-dom'
    ],
    plugins: [
        nodeResolve(),
        babel({ babelHelpers: 'bundled'}),
    ],
    output: {
        globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
        },
        sourcemap: true,
    }
}