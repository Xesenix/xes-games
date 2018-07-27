const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { application, webpack } = require('xes-webpack-core');

const app = application.getEnvApp();
const appWebpack = `./webpack.game-00.config.js`;

const factoryConfig = {
	useBabelrc: true,
};

if (fs.existsSync(appWebpack)) {
	module.exports = (env) => require(appWebpack)(webpack.webpackConfigFactory(factoryConfig));
} else {
	module.exports = (env) => {
		console.log(chalk.bold.yellow('Setting WEBPACK...'));
		const config = webpack.webpackConfigFactory(factoryConfig);

		config.output.filename = '[name].js';
		config.output.chunkFilename = '[name].js';

		// This cannot be used in testing environment
		if (process.env.ENV !== 'test') {
			config.optimization = {
				...config.optimization,
				splitChunks: {
					automaticNameDelimiter: '.',
					chunks: 'all',
					name: true,
					cacheGroups: {
						default: {
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
}
