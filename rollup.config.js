// 指定配置文件
// rollup -c build/rollup.config.js

// rollup-plugin-node-resolve 插件可以告诉 Rollup 如何查找外部模块，并将这些被引用点外部模块合并到我们的库中
import resolve from 'rollup-plugin-node-resolve';

// rollup 默认是使用 ES6 的模块加载机制，所以是不支持 CommonJS 模块的文件了，需要使用 rollup-plugin-commonjs 转换为 ES6 模块 供 Rollup 处理
// 值得注意点是，rollup 大打包后的 cjs, umd 并不支持 tree-shaking，所以请尽量使用 ES6 模块，以获得更精简的代码。
import commonjs from 'rollup-plugin-commonjs';

// babel 插件，将最新特性的 ES 代码转换为 ES5
import babel from 'rollup-plugin-babel';

// 默认情况下 rollup 不支持导入 json 模块，所以我们需要使用 json 插件来支持
import json from 'rollup-plugin-json';

// alias 与 webpack 的 alias 一样，可以我们减少文件路径的书写
import alias from 'rollup-plugin-alias';

// uglify 进一步压缩代码的体积，但是 uglify 不支持压缩 ES 模块和 ES6 语法，请使用 terser
import { uglify } from 'rollup-plugin-uglify';

// import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output: {
      file: 'bin/index.js',
      format: 'es',
      moduleName: 'ojo',
      banner: '', // 文件头部添加点内容
      footer: '',// 文件尾部添加点内容,
      plugins: [
        commonjs(),
        json(),
        resolve(),
        babel({
          exclude: 'node_modules/**', // 只编译我们的源代码,
          runtimeHelpers: true
        }),
        alias({
          resolve: ['.js'],
          lib: './src/lib'
        }),
        uglify
        // terser()
      ]
    }
  // 在使用 resolve 的情况下，我们仍然希望某些第三方库保持外部应用，可以使用 external 排除
  // external: ['node_modules/rxjs', 'node_modules/axios'],
};
