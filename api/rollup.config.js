import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: './dist/gazetteer-api.js',
    format: 'cjs'
  },
  plugins: [
    json(),
    nodeResolve(),
    commonjs(),
    babel()
  ]
};
