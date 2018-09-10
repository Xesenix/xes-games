const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const webpackBase = require('webpack');
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

	// VIS js css
	console.log(chalk.bold.yellow('Adding loader for VIS JS assets...'));
	config.module.rules.push({
		test: /\.(svg|png|jpg|jpeg|gif)$/,
		include: path.resolve('node_modules/vis/dist'),
		use: {
				loader: 'file-loader',
				options: {
						name: '[name].[ext]',
						outputPath: 'assets/vis',
				},
		},
	});

	// VIS js has broken moment use implementation
	// it needs global object just to not include useless locales
	config.plugins.push(new webpackBase.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|pl)$/));

	return config;
};

const baseConfiguration = configureWebpack(webpack.webpackConfigFactory(factoryConfig));

if (fs.existsSync(appWebpack)) {
	module.exports = (env) => require(appWebpack)(baseConfiguration);
} else {
	module.exports = (env) => baseConfiguration;
}
