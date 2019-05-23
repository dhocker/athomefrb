var webpack = require('webpack');
var path = require("path");
var SplitChunksPlugin = require("webpack/lib/optimize/SplitChunksPlugin");

console.log("");
console.log("Webpack Production Build");
console.log("------------------------");
console.log("process.env.WEBPACK_DEVTOOL: " + process.env.WEBPACK_DEVTOOL);
console.log("");

/*
    Initial config: http://tylermcginnis.com/react-js-tutorial-1-5-utilizing-webpack-and-babel-to-build-a-react-js-app/
    Multiple entry points methods:
        https://webpack.github.io/docs/multiple-entry-points.html
        https://github.com/webpack/webpack/tree/master/examples/multiple-entry-points
*/

module.exports = {
    entry: [
        './app/static/js/main.jsx'
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: __dirname + '/app/static/js',
                use: [
                    /*{ loader: 'react-hot-loader' },*/
                    { loader: 'babel-loader'}
                ]
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
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    { loader: 'url?limit=10000&mimetype=image/svg+xml' }
                ]
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
        filename: "index_bundler.js",
        path: __dirname + '/app/static/dist',
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
	resolve: {
		extensions: ['.js', '.jsx']
	},
	devtool: process.env.WEBPACK_DEVTOOL || 'cheap-module-source-map',
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
/*
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings: false
            }
        })
*/
	],
	optimization: {
	    minimize: true
	}
};
