const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry: {
        kb: ["babel-polyfill", "./src/index.tsx"]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    mode: "development",

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be pre handled by 'tslint-loader'.
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: "tslint-loader",
                options: {
                    configFile: 'tslint.json',
                    // Linting issues will be shown as warnings and build won't fails.
                    // Make it true to fail webpack build on linting errors.
                    emitErrors: true,
                    fileOutput: {
                        // The directory where each file's report is saved 
                        dir: '/target/lint-errors/kb-react',
                        // If true, all files are removed from the report 
                        // directory at the beginning of run 
                        clean: true
                    }
                }
            },

            // All files with a '.css' extension will be handled by 'css-loader' 
            {
                test: /\.css$/, use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            },

            {
                test: /\.wasm$/,
                loaders: ['wasm-loader']
            },
            
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    optimization: {
        runtimeChunk: "single", // enable "runtime" chunk
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    }
};

