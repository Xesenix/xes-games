const chalk = require('chalk');
const path = require('path');
const webpackBase = require('webpack');
const { webpack } = require('xes-webpack-core');

/**
 * Copy assets and fonts.
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (config) => {
	console.log(chalk.bold.yellow('Setting WEBPACK for game-01...'));
	config.module.rules.push(...webpack.loaders.shaderRulesFactory());

	if (process.env.ENV === 'test') {
		console.log(chalk.bold.yellow('Adding Phaser 3 environment setup...'));
		config.plugins.push(new webpackBase.DefinePlugin({
			// required by Phaser 3
			'CANVAS_RENDERER': JSON.stringify(true),
			'WEBGL_RENDERER': JSON.stringify(false),
		}));
	} else {
		console.log(chalk.bold.yellow('Adding Phaser 3 environment setup...'));
		config.plugins.push(new webpackBase.DefinePlugin({
			// required by Phaser 3
			'CANVAS_RENDERER': JSON.stringify(true),
			'WEBGL_RENDERER': JSON.stringify(true),
		}));

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

		/*config.externals = {
			...config.externals,
			moment: 'moment',
		};*/

		// config.devtool = 'cheap-module-source-map';

		// all externals need to be manually added in template
		// TODO: add them automatically
		/*config.externals = {
			...config.externals,
			phaser: 'Phaser',
		};

		config.plugins.push(new CopyWebpackPlugin([
			{
				from: './node_modules/phaser/dist/phaser.min.js',
				to: 'phaser.min.js',
			},
		]));*/
	}

	return config;
};
