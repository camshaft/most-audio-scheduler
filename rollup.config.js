import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'
import external from 'rollup-plugin-auto-external'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'build/index.mjs',
      format: 'es'
    },
    {
      file: 'build/index.js',
      format: 'cjs'
    }
  ],
  external: id => id.includes('babel-runtime'),
  plugins: [
    external(),
    typescript(),
    babel({
      runtimeHelpers: true
    }),

    nodeResolve({
      jsnext: true,
      main: true,
    }),

    commonjs({
      include: 'node_modules/**'
    }),
  ]
}
