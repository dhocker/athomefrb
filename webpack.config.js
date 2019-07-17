var webpack = require('webpack');
var path = require("path");
// var SplitChunksPlugin = require("webpack/lib/optimize/SplitChunksPlugin");

console.log("");
console.log("Webpack Development Build");
console.log("-------------------------");
console.log("process.env.WEBPACK_DEVTOOL: " + process.env.WEBPACK_DEVTOOL);
console.log("");

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

/*
    Initial config: http://tylermcginnis.com/react-js-tutorial-1-5-utilizing-webpack-and-babel-to-build-a-react-js-app/
    Multiple entry points methods:
        https://webpack.github.io/docs/multiple-entry-points.html
        https://github.com/webpack/webpack/tree/master/examples/multiple-entry-points
*/

module.exports = {
    entry: {
        main: './app/static/js/index.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: __dirname + '/app/static/js',
                use: [
                    { loader: 'babel-loader'}
                ]
            },
            {
                test: /\.(js|jsx)$/,
                use: [
                    { loader: 'babel-loader'},
                    {
                        loader: "eslint-loader",
                        options: {
                            emitWarning: true
                        }
                    }
                ],
                exclude: /(node_modules)/
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader'}
                ]
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    { loader: 'file' }
                ]
            },
            {
                test: /\.(woff|woff2)$/,
                use: [
                    { loader: 'url?prefix=font/&limit=5000' }
                ]
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    { loader: 'url?limit=10000&mimetype=application/octet-stream' }
                ]
            },
            {
                test: /\.svg$/,
                loader: 'react-svginline'
            },
            {
                test: /\.gif/,
                use: [
                    { loader: 'url-loader?limit=10000&mimetype=image/gif' }
                ]
            },
            {
                test: /\.jpg/,
                use: [
                    { loader: 'url-loader?limit=10000&mimetype=image/jpg' }
                ]
            },
            {
                test: /\.png/,
                use: [
                    { loader: 'url-loader?limit=10000&mimetype=image/png' }
                ]
            }
        ]
    },
    output: {
        filename: "bundler.js",
        path: __dirname + '/app/static/dist',
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
	resolve: {
		extensions: ['.js', '.jsx']
	},
	devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
	plugins: [
		new webpack.NoEmitOnErrorsPlugin()
	]
};
