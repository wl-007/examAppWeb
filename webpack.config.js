const path = require('path'); //webpack内置路径处理模块
const HtmlWebpackPlugin = require('html-webpack-plugin'); //html处理插件

// 引入处理css的插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//复制插件的引入
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { NODE_ENV } = process.env;
const examHtmlLists = ['tests-list', 'tests-basic-info', 'tests-end']; //考试相关界面公用 exam js scss
const togetherHtmlLists = ['login', 'reg', 'center']; //登录、注册、个人中心公用 together js scss
const htmlLists = ['index', 'exercises', 'answers', 'errors', 'collections'];
const jsLists = ['index', 'ui', 'utils', 'together', 'errors', 'collections', "tests", 'exercises', 'answers'];
module.exports = {
    // mode: 'development',
    // mode: 'production',
    mode: NODE_ENV,
    //? 入口
    entry: {
        // index: './src/js/index.js',
        ...jsLists.reduce(function (total, item) {
            return { ...total, [item]: `./src/js/${item}.js` };
        }, {}),
    },
    //? 出口
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
        clean: true, //将上一次打包的文件清楚掉
    },
    //? 插件
    plugins: [
        // new HtmlWebpackPlugin({
        //     publicPath: '../',
        //     template: './src/html/login.html', //指定开发时 源html文件的位置
        //     filename: 'html/paysuccess.html', //指定打包后的文件路径以及文件名
        //     chunks: ['together'], //指定对应需要引入的js文件
        // }),
        ...examHtmlLists.map((item) => {
            //?html处理
            return new HtmlWebpackPlugin({
                publicPath: '../',
                template: `./src/html/${item}.html`, //指定开发时 源html文件的位置
                filename: `html/${item}.html`, //指定打包后的文件路径以及文件名
                chunks: ['tests'], //指定对应需要引入的js文件
            });
        }),
        ...togetherHtmlLists.map((item) => {
            //?html处理
            return new HtmlWebpackPlugin({
                publicPath: '../',
                template: `./src/html/${item}.html`, //指定开发时 源html文件的位置
                filename: `html/${item}.html`, //指定打包后的文件路径以及文件名
                chunks: ['together'], //指定对应需要引入的js文件
            });
        }),
        ...htmlLists.map((item) => {
            //?html处理
            return new HtmlWebpackPlugin({
                publicPath: '../',
                template: `./src/html/${item}.html`, //指定开发时 源html文件的位置
                filename: `html/${item}.html`, //指定打包后的文件路径以及文件名
                chunks: [item], //指定对应需要引入的js文件
            });
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css', //配置文件输出的路径以及名字
        }),
        new CopyWebpackPlugin({
            // 复制文件直接到dist下
            patterns: [
                {
                    from: './src/static',
                    to: './static',
                },
            ],
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
        }),
    ],
    //? 配置loader 加载器
    module: {
        rules: [
            {
                //!css
                test: /\.css$/i, //正则的匹配，匹配上所有的css后缀的文件
                exclude: /node_modules/, //正则匹配上需要排除的文件夹
                use: [
                    // 'style-loader', //在js中将样式通过style 的方式引入到页面中，后加载
                    MiniCssExtractPlugin.loader, //替换掉了style-loader,将css以文件的形式引入html
                    'css-loader', //将css样转化成模块，先加载，放在后面
                ],
            },
            {
                //!scss
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    // 将 JS 字符串生成为 style 节点
                    //   'style-loader',
                    MiniCssExtractPlugin.loader,
                    // 将 CSS 转化成 CommonJS 模块
                    'css-loader',
                    // 将 Sass 编译成 CSS
                    'sass-loader',
                ],
            },
            {
                //!less
                test: /\.less$/i,
                exclude: /node_modules/,
                use: [
                    // 将 JS 字符串生成为 style 节点
                    //   'style-loader',
                    MiniCssExtractPlugin.loader,
                    // 将 CSS 转化成 CommonJS 模块
                    'css-loader',
                    // 将 Sass 编译成 CSS
                    'sass-loader',
                ],
            },
            //css中的字体loader配置
            {
                test: /\.(ttc|ttf|)$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            outputPath: './fonts/', //处理图片输出过后的路径
                            limit: 1024 * 0, //对0kb以下的进行base64的处理
                            esModule: false, //解决插件之间的冲突
                        },
                    },
                ],
            },
            //css中的图片loader配置
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            outputPath: './images/', //处理图片输出过后的路径
                            limit: 1024 * 8, //对8kb一下的图片进行base64的处理
                            esModule: false, //解决插件之间的冲突
                        },
                    },
                ],
            }, //配置html 中的图片处理
            {
                test: /\.(html|htm)$/i,
                exclude: /node_modules/,
                use: ['html-withimg-loader'],
            },
        ],
    },
    // 服务器的配置
    devServer: {
        host:'0.0.0.0',
        hot: true, //热更新
        port: 8082, //启动的服务器端口号
        open: './html/index.html', //开启服务器成功后自动打开浏览器
        //配置代理服务器,此处配置的跨域只能在开发阶段使用。临时解决，打包之后代理服务器就不存在了
        proxy: {
            // 匹配所有包含 /api 开头的请求
            '/api': {
                target: 'http://127.0.0.1:8088',   // 真正处理请求的目标后端服务器地址
                changeOrigin: true,
                // 前端所有以 /api 开头的请求，转发到后端服务器后，会自动去掉 /api
                pathRewrite: {
                    '^/api': '/'
                }
            }
        }
    },
    devtool: 'source-map'
};
