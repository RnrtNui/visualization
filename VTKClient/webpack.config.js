var path = require("path");
var webpack = require("webpack");
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core.rules;
var HtmlWebpackPlugin = require('html-webpack-plugin');
const uglify = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GenerateAssetPlugin = require('generate-asset-webpack-plugin')
const createServerConfig = function (compilation) {
    let serverConfig = { baseUrl: 'http://127.0.0.1:8002' };   //run build 后端配置的ip地址
    return JSON.stringify(serverConfig);
}
module.exports = {
    mode: "development",
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    entry: [
        "webpack/hot/only-dev-server.js",
        path.join(__dirname, "/src/index.js"),
    ],

    output: {
        publicPath: "/",
        path: path.join(__dirname, "/build"),
        filename: "bundle.js",
    },

    devServer: {
        port: 4000,
        host: '0.0.0.0',
        useLocalIp: true,
        watchContentBase: true,
        disableHostCheck: true,
        watchOptions: {
            poll: true
        },
        hot: true,
        overlay: {
            warnings: true,
            errors: true
        },
        publicPath: "/",
        proxy: {
            "/data": {
                target: "http://0.0.0.0:8002",
                changeOrigin: true,
                pathRewrite: {
                    "^/data": ""
                }
            }
        },
        // historyApiFallback: true,
        historyApiFallback: {
            rewrites: [
                { from: /./, to: 'index.html' }
            ]
        },//不跳转，用于开发单页面应用，依赖于HTML5 history API 设置为true点击链接还是指向index.html
    },

    module: {
        rules: [
            // 配置的是用来解析.css文件的loader(style-loader和css-loader)
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            "@babel/preset-react",
                            "@babel/preset-env"
                        ],
                        "plugins": [
                            "react-hot-loader/babel",
                            "@babel/plugin-proposal-class-properties",
                            // 开启react代码的模块热替换（HMR）
                        ]
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: 'file-loader'
            }, { test: /\.(jpg|png|gif|bmp|jpeg)$/, use: 'url-loader?limit=1000&name=[hash:8]-[name].[ext]' },
        ].concat(vtkRules)
    },

    plugins: [
        // new uglify(),    //压缩js代码
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),//当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, './src/template.html'),   //指定模板页面,
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new GenerateAssetPlugin({
            filename: 'serverconfig.json',
            fn: (compilation, cb) => {
                cb(null, createServerConfig(compilation))
            },
            extraFiles: []
        }),
    ],
    devtool: "inline-source-map",//每个module会通过eval()来执行，生成一个没有列信息（column-mappings）的SourceMaps文件，不包含loader的 sourcemap（譬如 babel 的 sourcemap）.
}
