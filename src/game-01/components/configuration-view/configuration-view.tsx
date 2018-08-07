import Checkbox from '@material-ui/core/Checkbox';
import MuteOffIcon from '@material-ui/icons/VolumeOff';
import MuteOnIcon from '@material-ui/icons/VolumeUp';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Action, Store } from 'redux';

import { createSetMuteAction, createSetVolumeAction } from 'game-01/src/ui/actions';
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

export interface IConfigurationProps {
	store?: Store<IUIState>;
}
export interface IConfigurationState { }

class ConfigurationViewComponent extends React.Component<IConfigurationProps, IConfigurationState> {
	public render(): any {
		return (<div className="panel-container">
			<div className="panel article">
				<div className="field">
					<label>{ __('volume') }</label>
					<input
						type="range"
						min={ 0 }
						max={ 1 }
						step={ 0.05 }
						value={ this.getValue<number>('volume', 1) }
						onChange={ (event) => this.dispatch(createSetVolumeAction(Number.parseFloat(event.target.value))) }
					/>
				</div>
				<div className="field">
					<label>{ __('mute') }</label>
					<Checkbox
						className="field"
						checkedIcon={ <MuteOffIcon /> }
						icon={ <MuteOnIcon /> }
						checked={ this.getValue<boolean>('mute', false) }
						onChange={ (event, checked: boolean) => this.dispatch(createSetMuteAction(checked)) }
					/>
					</div>
			</div>
		</div>);
	}

	private getValue<T>(key: string, defaultValue: T): T {
		return this.props.store ? this.props.store.getState()[key] : defaultValue;
	}

	private dispatch(action: Action): void {
		const { store } = this.props;

		if (store) {
			store.dispatch(action);
		}
	}
}

export default hot(module)(connectToInjector<IConfigurationProps>(ConfigurationViewComponent, {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
