import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';
import { connectToDI } from 'game-01/src/di.context';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { __ } from 'lib/localize';

import './game-view.scss';

export interface IGameViewProps {
	di?: Container | null;
}

export interface IGameViewState {
	fullscreen: boolean;
	tab: 'configuration' | 'game';
	paused: boolean;
	mute: boolean;
	volume: number;
}

class GameViewComponent extends React.Component<IGameViewProps, IGameViewState> {
	private fullScreenContainer?: HTMLDivElement;
	private store?: Store<IUIState>;
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

	public componentDidMount() {
		const { di } = this.props;

		if (!!di) {
			di.get<IUIStoreProvider>('ui:store')().then((store: Store<IUIState>) => {
				this.store = store;
				this.unsubscribe = this.store.subscribe(() => {
					if (this.store) {
						this.setState(this.store.getState());
					}
				});
				this.setState(this.store.getState());
			});
		}
	}

	public componentWillUnmount() {
		console.log('GameViewComponent:componentWillUnmount');

		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	public render(): any {
		console.log('=== GameViewComponent:render');
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
				{ tab === 'configuration' ? <div key={'configuration'}>CONFIGURATION</div> : null }
				{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={true}/> : null }
			</div>
		</FullScreenComponent>);
	}

	private openConfigurationHandle = (): void => {
		console.log('=== CLICK:GameViewComponent:openConfigurationHandle');
		this.setState({
			tab: 'configuration',
		});
	}

	private backHandle = (): void => {
		console.log('=== CLICK:GameViewComponent:backHandle');
		this.setState({
			tab: 'game',
		});
	}

	private toggleFullScreen = (): void => {
		console.log('=== CLICK:GameViewComponent:toggleFullScreen');
		this.setState({
			fullscreen: !this.state.fullscreen,
		});
	}
	private togglePause = () => {
		console.log('=== CLICK:GameViewComponent:togglePause');
		const { paused } = this.state;
		if (this.store) {
			this.store.dispatch(createSetPauseAction(!paused));
		}
	}

	private toggleMute = () => {
		console.log('=== CLICK:GameViewComponent:toggleMute');
		const { mute } = this.state;
		if (this.store) {
			this.store.dispatch(createSetMuteAction(!mute));
		}
	}
}

export default hot(module)(connectToDI<IGameViewProps>(GameViewComponent));
