const { karma } = require('xes-webpack-core');

const webpack = require('./webpack.config.js')();

module.exports = function(config) {
	// FIXME: this makes it harder to localize issue
	// webpack.devtool = 'cheap-module-source-map';
	karma.configure(config, webpack);
}
