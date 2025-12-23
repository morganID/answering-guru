import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'app.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    name: 'AnsweringGuru'
  },
  plugins: [resolve()]
};
