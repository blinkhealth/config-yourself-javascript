//@ts-check
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import { resolve } from 'path'
//@ts-ignore
import pkg from './package.json';
const path = '.';

const config = {
  input: resolve(path, pkg.src),
  output: [
    {
      file: resolve(path, pkg.main),
      format: 'cjs',
    },
    {
      file: resolve(path, pkg.module),
      format: 'es',
    },
  ],
  external: [
    'crypto',
    'fs',
    'path',
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript({
      // @ts-ignore
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
    }),
    babel({
      exclude: 'node_modules/**',
      ignore: ['**/*.test.ts', '__mocks__/*'],
      extensions: ['.ts', '.tsx'],
      include: ['src/**/*'],
    }),
  ],
};

export default config;
