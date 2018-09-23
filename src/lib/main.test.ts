import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'reflect-metadata';

Enzyme.configure({ adapter: new Adapter() });

const excludeRegexp: RegExp = /.*\/(main|index|interfaces)\./;
/**
 * We need to load all test files to be included in karma. And all others to generate test coverage.
 * @see https://github.com/webpack-contrib/karma-webpack#alternative-usage
 */
{
	const contextLib = require.context('sound', true, /\.(t|j)sx?$/);
	contextLib.keys().filter((p: string) => !excludeRegexp.test(p)).forEach(contextLib);
}
{
	const contextLib = require.context('sound-scape', true, /\.(t|j)sx?$/);
	contextLib.keys().filter((p: string) => !excludeRegexp.test(p)).forEach(contextLib);
}
