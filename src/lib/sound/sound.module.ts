import { interfaces } from 'inversify';
import { Store } from 'redux';

import { IApplication } from 'lib/interfaces';

import { ISoundConfigurationState, ISoundManagerPlugin, soundManagerPluginFactory } from './sound-manager.plugin';

export class SoundModule<T extends ISoundConfigurationState> {
	public static register<T extends ISoundConfigurationState>(app: IApplication) {
		app.bind<SoundModule<T>>('sound:module').toConstantValue(new SoundModule<T>(app));
	}

	constructor(private app: IApplication) {
		this.app = app;

		// TODO: this factory returns class figure out how to correctly type this binding
		this.app.bind('sound-manager-plugin:factory')
			.toFactory((context: interfaces.Context) => {
				const store = context.container.get<Store<T>>('data-store');
				return () => soundManagerPluginFactory<T>(store);
			});
	}
}
