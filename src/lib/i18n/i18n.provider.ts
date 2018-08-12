import { EventEmitter } from 'events';
import { interfaces } from 'inversify';
import { Gettext } from 'node-gettext';
import { Store } from 'redux';

import { IUIStoreProvider } from 'game-01/src/ui/store.provider';

import { createLanguageReadyAction, LanguageType } from './actions';
import { i18n } from './i18n';

/**
 * Update i18n object after each change in store language setup.
 * Also load translations if needed.
 */
const syncLocaleWithStore = (store) => () => {
	return new Promise((resolve) => {
		const { language, languages } = store.getState();
		if (!languages[language].ready) {
			import(`${process.env.LOCALES_DIR}/messages.${language}.po`).then((content) => {
				i18n.addTranslations(language, 'messages', content);
				i18n.setLocale(language);
				store.dispatch(createLanguageReadyAction(language, true));
				resolve();
			});
		} else {
			i18n.setLocale(language);
			resolve();
		}
	});
};

export type II18nProvider = () => Promise<Gettext>;

/**
 * Listens to application boot and then connects to data store to react to changes in current language.
 */
export function I18nProvider(context: interfaces.Context) {
	const console: Console = context.container.get<Console>('debug:console');
	console.debug('I18nProvider');

	return () => new Promise((resolve, reject) => {
		try {
			const storeProvider = context.container.get<IUIStoreProvider>('data-store-provider');
			return storeProvider().then((store: Store<{ language: LanguageType }>) => {
				store.subscribe(syncLocaleWithStore(store));
				return syncLocaleWithStore(store)().then(() => {
					resolve(i18n);
				});
			});
		} catch (error) {
			return reject(error);
		}
	});
}
