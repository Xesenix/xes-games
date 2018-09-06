import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'reflect-metadata';

Enzyme.configure({ adapter: new Adapter() });

const excludeRegexp: RegExp = /\..*\/(main|index)\./;
/**
 * We need to load all test files to be included in karma. And all others to generate test coverage.
 * @see https://github.com/webpack-contrib/karma-webpack#alternative-usage
 */
const contextMain = require.context('./', true, /\.(t|j)sx?$/);
contextMain.keys().filter((p: string) => !excludeRegexp.test(p)).forEach(contextMain);

// add libraries that need to work with main application
// TODO: find a way to only test dependencies
{
	const contextLib = require.context('../lib/sound', true, /\.(t|j)sx?$/);
	contextLib.keys().filter((p: string) => !excludeRegexp.test(p)).forEach(contextLib);
}
{
	const contextLib = require.context('../lib/sound-scape', true, /\.(t|j)sx?$/);
	contextLib.keys().filter((p: string) => !excludeRegexp.test(p)).forEach(contextLib);
}
