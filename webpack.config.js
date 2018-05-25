const path = require('path');
const fs = require('fs');
const { application, webpack } = require('xes-webpack-core');

const app = application.getEnvApp();
const appWebpack = `./webpack.game-00.config.js`;

const config = {
	useBabelrc: false,
}

if (fs.existsSync(appWebpack)) {
	module.exports = (env) => require(appWebpack)(webpack.webpackConfigFactory(config));
} else {
	module.exports = (env) => webpack.webpackConfigFactory(config);
}
