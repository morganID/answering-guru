import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default {
  input: 'app.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    name: 'AnsweringGuru'
  },
  plugins: [
    resolve(),
    copy({
      targets: [
        { src: 'index.html', dest: 'dist/' },
        { src: 'styles.css', dest: 'dist/' }
      ]
    })
  ]
};
