import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'iife',
      name: 'WebVoiceNavigator',
      file: 'dist/wvn.js',
    },
    plugins: [nodeResolve(), typescript(), terser()],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
        exports: 'named',
        entryFileNames: '[name].js',
      },
      {
        dir: 'dist/esm',
        format: 'es',
        preserveModules: true,
        exports: 'named',
        entryFileNames: '[name].js',
      },
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts'],
      }),
      commonjs({}),
      typescript(),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
