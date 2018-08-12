import { ContainerModule, interfaces } from 'inversify';

import { I18nProvider, II18nProvider } from './i18n.provider';

/**
 * i18n:provider needs to be initialized for translations to work
 */
export const I18nModule = () => new ContainerModule((bind: interfaces.Bind) => {
	bind<II18nProvider>('i18n:provider').toProvider(I18nProvider);
});
