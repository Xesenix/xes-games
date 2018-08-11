import { ContainerModule, interfaces } from 'inversify';
import { IApplication } from 'lib/interfaces';
import { Store } from 'redux';

import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { i18n } from 'lib/localize';

export const I18nModule = (app: IApplication) => new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
	// TODO: consider introducing Application interface over inversify Container
	app.eventManager.addListener('app:boot', () => {
		app.get<IUIStoreProvider>('ui:store')().then((store: Store) => {
			store.subscribe(() => {
				const { language } = store.getState();
				i18n.setLocale(language);
			});
		});
	});
});
