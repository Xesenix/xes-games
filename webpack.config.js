const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { application, webpack } = require('xes-webpack-core');

const app = application.getEnvApp();
const appWebpack = `./webpack.${app}.config.js`;

const factoryConfig = {
	useBabelrc: true,
};

const configureWebpack = (config) => {
	console.log(chalk.bold.yellow('Setting WEBPACK...'));

	config.output.filename = '[name].js';
	config.output.chunkFilename = '[name].js';

	// This cannot be used in testing environment
	if (process.env.ENV !== 'test') {
		config.optimization = {
			...config.optimization,
			splitChunks: {
				automaticNameDelimiter: '.',
				chunks: 'async',
				name: true,
				cacheGroups: {
					default: {
						minSize: 120000,
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
					},
					vendors: {
						priority: -10,
						test: /[\\/]node_modules[\\/]/,
					},
				},
			},
		};
	}

	return config;
};

const baseConfiguration = configureWebpack(webpack.webpackConfigFactory(factoryConfig));

if (fs.existsSync(appWebpack)) {
	module.exports = (env) => require(appWebpack)(baseConfiguration);
} else {
	module.exports = (env) => baseConfiguration;
}
