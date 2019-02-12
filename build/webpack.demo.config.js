const { resolve } = require('path')
const internalIp = require('internal-ip')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Webpack = require('webpack')
const config = require(`./build/config/${process.env.npm_config_config}` || 'prod')
const pkgInfo = require('./package.json')

// const history = require('connect-history-api-fallback')
// const convert = require('koa-connect')

const dev = Boolean(process.env.WEBPACK_SERVE)

module.exports = {
  mode: dev ? 'development' : 'production',

  devtool: dev ? 'cheap-module-eval-source-map' : 'hidden-source-map',

  entry: config.entry,

  resolve: {
    // 简化 import 路径
    alias: {
      '~': resolve(__dirname, 'src')
    }
  },

  output: {
    path: resolve(__dirname, 'dist'),
    // publicPath: config.publicPath,
    // chunkFilename 使用 [chunkhash] 防止浏览器读取错误缓存，那么 entry 同样需要加上 hash。
    // 但使用 webpack-serve 启动开发环境时，entry 文件是没有 [chunkhash] 的，用了会报错。
    filename: dev ? '[name].js' : '[name].[chunkhash].js',
    /*
    代码中引用的文件（js、css、图片等）会根据配置合并为一个或多个包，我们称一个包为 chunk。
    每个 chunk 包含多个 modules。无论是否是 js，webpack 都将引入的文件视为一个 module。
    chunkFilename 用来配置这个 chunk 输出的文件名。

    [chunkhash]：这个 chunk 的 hash 值，文件发生变化时该值也会变。使用 [chunkhash] 作为文件名可以防止浏览器读取旧的缓存文件。

    还有一个占位符 [id]，编译时每个 chunk 会有一个id。
    我们在这里不使用它，因为这个 id 是个递增的数字，增加或减少一个chunk，都可能导致其他 chunk 的 id 发生改变，导致缓存失效。
    */
    chunkFilename: '[chunkhash].js'
  },

   externals: {
     jQuery: 'jquery',
     $: 'jquery'
   },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: '/node_modules',
        use: [
          {
            loader: 'babel-loader'
          },
          'eslint-loader'
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              //  使用 root 参数，可以使html中 / 开头的文件相对于 root 目录解析。
              root: resolve(__dirname, 'src'),
              attrs: ['img:src', 'link:href']
            }
          }
        ]
      },
      //  先使用 css - loader 处理， 返回的结果交给 style - loader 处理。
      //  css - loader 将 css 内容存为 js 字符串，
      // 并且会把 background, @font - face 等引用的图片，
      //  字体文件交给指定的 loader 打包，
      // postcss-loader 使用 autoprefixer 自动添加浏览器 css 前缀
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      {
        // 匹配各种格式的图片和字体文件
        // 上面 html - loader 会把 html 中 < img > 标签的图片解析出来， 文件名匹配到这里的 test 的正则表达式，
        // css - loader 引用的图片和字体同样会匹配到这里的 test 条件
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  // 配置 webpack 插件
  // plugin 和 loader 的区别是， loader 是在
  // import 时根据不同的文件名， 匹配不同的 loader 对这个文件做处理，
  // 而 plugin, 关注的不是文件的格式， 而是在编译的各个阶段， 会触发不同的事件， 让你可以干预每个编译阶段。
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      /*
      因为和 webpack 4 的兼容性问题，chunksSortMode 参数需要设置为 none
      https://github.com/jantimon/html-webpack-plugin/issues/870
      */
      chunksSortMode: 'none'
    }),
    /*
    使用文件路径的 hash 作为 moduleid。
    虽然我们使用 [chunkhash] 作为 chunk 的输出名，但仍然不够。
    因为 chunk 内部的每个 module 都有一个 id，webpack 默认使用递增的数字作为 moduleid。
    如果引入了一个新文件或删掉一个文件，可能会导致其他文件的 moduleid 也发生改变，
    那么受影响的 module 所在的 chunk 的 [chunkhash] 就会发生改变，导致缓存失效。
    因此使用文件路径的 hash 作为 moduleid 来避免这个问题。
    */
    new Webpack.HashedModuleIdsPlugin(),
    new Webpack.DefinePlugin({
      DEBUG: dev,
      VERSION: JSON.stringify(pkgInfo.version),
      CONFIG: JSON.stringify(config.runtimeChunk)
    }),
    new Webpack.ProvidePlugin({
      $: 'jquery',
      'jQuery': 'jquery'
    })
  ],
  optimization: {
    /*
    上面提到 chunkFilename 指定了 chunk 打包输出的名字，那么文件名存在哪里了呢？
    它就存在引用它的文件中。这意味着一个 chunk 文件名发生改变，会导致引用这个 chunk 文件也发生改变。
    runtimeChunk 设置为 true, webpack 就会把 chunk 文件名全部存到一个单独的 chunk 中，
    这样更新一个文件只会影响到它所在的 chunk 和 runtimeChunk，避免了引用这个 chunk 的文件也发生改变。
    */
    // runtimeChunk 本身也会发生变化吧???
    runtimeChunk: true,
    splitChunks: {
      /*
      默认 entry 的 chunk 不会被拆分
      因为我们使用了 html-webpack-plugin 来动态插入 <script> 标签，entry 被拆成多个 chunk 也能自动被插入到 html 中，
      所以我们可以配置成 all, 把 entry chunk 也拆分了
      */
      chunks: 'all'
    }
  },
  performance: {
    // 开发环境关闭每个输出的 js 文件的大小不要超过 250 kb 的警告
    hints: dev ? false : 'warning'
  }
}

if (dev) {
  module.exports.serve = {
    host: '0.0.0.0',
    port: config.serve.port,
    // 开发环境允许其他电脑访问
    hot: {
      host: {
        client: internalIp.v4.sync(),
        server: '0.0.0.0'
      }
    }
    // dev: {
    //   publicPath: config.publicPath
    // }
  }
}
