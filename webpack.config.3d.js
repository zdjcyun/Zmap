const path = require("path");
const webpack = require('webpack');

const outSdk = 'map3d';

const srcmap = {
    map2d: path.resolve(__dirname, "dist/map2d"),
    map3d: path.resolve(__dirname, "dist/map3d"),
    map2d_src: "./src/ol/Map2d.js",
    map3d_src: "./src/cesium/Map3d.js",
};

module.exports = {
    mode: "production",
    performance: {
        hints: false
    },
    entry: {
        [outSdk]: srcmap[outSdk + '_src']
    },
    output: {
        publicPath: "./",
        library: "zgis3d",
        libraryTarget: "umd",
        libraryExport: 'default',
        umdNamedDefine: true,
        path: srcmap[outSdk],
        filename: "zgis.[name].min.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /[lib,libs,node_modules]/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.less$/,
                exclude: /[lib,libs,node_modules]/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: "less-loader"
                    }
                ]
            },
            {
                test: /\.scss$/,
                exclude: /[lib,libs,node_modules]/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|libs)/, 
                use: [{
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            '@babel/preset-env',
                        ], 
                        plugins: [
                            "@babel/plugin-transform-runtime",
                        ]
                    }
                }]
            },
        ]
    },
    plugins: [],
};