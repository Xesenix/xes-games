import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import { createSetVolumeAction } from 'game-01/src/ui/actions'
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';

export interface IConfigurationProps {
	store?: Store<IUIState>;
}
export interface IConfigurationState { }

class ConfigurationViewComponent extends React.Component<IConfigurationProps, IConfigurationState> {
	private volumeInput: HTMLInputElement;

	public render(): any {
		const { store } = this.props;
		const { volume } = store ? store.getState() : { volume: 1 };

		return (<div>
			Configuration
			<div>
				<label>Volume</label>
				<input type="range" min="0" max="1" step="0.05" ref={ this.bindContainer } value={ volume } onChange={ this.setVolume }/>
			</div>
		</div>);
	}

	private bindContainer = (el: HTMLInputElement): void => { this.volumeInput = el; };

	private setVolume = (): void => {
		const { store } = this.props;

		if (store) {
			store.dispatch(createSetVolumeAction(Number.parseFloat(this.volumeInput.value)));
		}
	}
}

export default hot(module)(connectToInjector<IConfigurationProps>(ConfigurationViewComponent, {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
