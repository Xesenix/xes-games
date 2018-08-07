import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import ConfigurationViewComponent from 'game-01/components/configuration-view/configuration-view';
import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

import './game-view.scss';

export interface IGameViewProps {
	di?: Container;
	store?: Store<IUIState>;
}

export interface IGameViewState {
	fullscreen: boolean;
	tab: 'configuration' | 'game';
	paused: boolean;
	mute: boolean;
	volume: number;
}

class GameViewComponent extends React.PureComponent<IGameViewProps, IGameViewState> {
	private fullScreenContainer?: HTMLDivElement;
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			fullscreen: false,
			tab: 'game',
			paused: false,
			mute: false,
			volume: 1,
		};
	}

	public componentDidMount(): void {
		this.bindToStore();
	}

	public componentDidUpdate(): void {
		this.bindToStore();
	}

	public componentWillUnmount(): void {
		console.log('GameViewComponent:componentWillUnmount');

		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	public render(): any {
		const { tab = 'game', fullscreen, paused, mute } = this.state;

		return (<FullScreenComponent fullscreen={fullscreen}>
			<div className="panel panel-primary" ref={(el: HTMLDivElement) => this.fullScreenContainer = el}>
				<ul className="menu-vertical">
					{ tab === 'configuration' ? <li><a className="btn" onClick={this.backHandle}>{ __('Back') }</a></li> : null }
					{ tab === 'game' ? <li><a className="btn" onClick={this.openConfigurationHandle}>{ __('Configuration') }</a></li> : null }
					<li><a className="btn" onClick={this.toggleFullScreen}>{ __('Fullscreen') }</a></li>
					<li><a className={['btn', paused ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.togglePause}>{ __('Pause') }</a></li>
					<li><a className={['btn', mute ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.toggleMute}>{ __('Mute') }</a></li>
				</ul>
				{ tab === 'configuration' ? <ConfigurationViewComponent/> : null }
				{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={true}/> : null }
			</div>
		</FullScreenComponent>);
	}

	private bindToStore(): void {
		const { store } = this.props;

		if (!this.unsubscribe && store) {
			this.unsubscribe = store.subscribe(() => {
				if (store) {
					this.setState(store.getState());
				}
			});
			this.setState(store.getState());
		}
	}

	private openConfigurationHandle = (): void => {
		this.setState({
			tab: 'configuration',
		});
	}

	private backHandle = (): void => {
		this.setState({
			tab: 'game',
		});
	}

	private toggleFullScreen = (): void => {
		this.setState({
			fullscreen: !this.state.fullscreen,
		});
	}
	private togglePause = (): void => {
		const { store } = this.props;
		const { paused } = this.state;
		if (store) {
			store.dispatch(createSetPauseAction(!paused));
		}
	}

	private toggleMute = (): void => {
		const { store } = this.props;
		const { mute } = this.state;
		if (store) {
			store.dispatch(createSetMuteAction(!mute));
		}
	}
}

export default hot(module)(connectToInjector<IGameViewProps>(GameViewComponent, {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
