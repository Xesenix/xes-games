import { ContainerModule, interfaces } from 'inversify';
import { DefaultTheme, ITheme } from './theme';

export const ThemeModule = () => new ContainerModule((bind: interfaces.Bind) => {
	bind<ITheme>('theme:default').to(DefaultTheme);
});
