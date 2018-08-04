import { Container } from 'inversify';
import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import { inject } from 'game-01/src/di.context';
import { IPhaserGameProvider } from 'game-01/src/phaser/game.provider';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { IUIState } from 'game-01/src/ui/reducers/index';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { __ } from 'lib/localize';

import './phaser-view.scss';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;

export interface IPhaserViewProps {
	di?: Container;
	store?: Store<IUIState>;
	keepInstanceOnRemove: boolean;
}

export interface IPhaserViewState {
	mute: boolean;
	paused: boolean;
}

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			mute: false,
			paused: false,
		};
	}

	public componentDidMount() {
		const { di } = this.props;

		if (!!di && gameContainer) {
			if (game && game.isBooted) {
				gameContainer.appendChild(game.canvas);
			} else {
				di.bind<HTMLElement | null>('phaser:container').toDynamicValue(() => gameContainer);
				di.get<IPhaserGameProvider>('phaser:game-provider')().then((result: Phaser.Game) => game = result);
			}
		}

		this.bindToStore();
	}

	public componentDidUpdate() {
		this.bindToStore();
	}

	public componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	public render(): any {
		return (<div className="phaser-view" ref={ this.bindContainer }>
			<ul className="menu-vertical">
				<li><a className={['btn', this.state.paused ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.togglePause}>{ __('Pause') }</a></li>
				<li><a className={['btn', this.state.mute ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.toggleMute}>{ __('Mute') }</a></li>
			</ul>
		</div>);
	}

	private bindToStore() {
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

	private bindContainer = (el: HTMLDivElement) => gameContainer = el;

	private togglePause = () => {
		const { store } = this.props;
		const { paused } = this.state;
		if (store) {
			store.dispatch(createSetPauseAction(!paused));
		}
	}

	private toggleMute = () => {
		const { store } = this.props;
		const { mute } = this.state;
		if (store) {
			store.dispatch(createSetMuteAction(!mute));
		}
	}
}

export default hot(module)(inject<IPhaserViewProps>(PhaserViewComponent, {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
