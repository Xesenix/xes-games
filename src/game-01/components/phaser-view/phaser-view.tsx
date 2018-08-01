import { Container } from 'inversify';
import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import { connectToDI } from 'game-01/src/di.context';
import { IPhaserGameProvider } from 'game-01/src/phaser/game.provider';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { IUIState } from 'game-01/src/ui/reducers/index';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { __ } from 'lib/localize';

import './phaser-view.scss';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;
let di: Container | null | undefined;

export interface IPhaserViewProps {
	di?: Container | null;
	keepInstanceOnRemove: boolean;
}
export interface IPhaserViewState {
	mute: boolean;
	paused: boolean;
}

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	private store?: Store<IUIState>;
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			mute: false,
			paused: false,
		};
	}

	public componentDidMount() {
		di = this.props.di;
		console.log('PhaserViewComponent:componentDidMount', game, gameContainer);

		if (!!di && gameContainer) {
			if (game && game.isBooted) {
				if (this.store) {
					this.setState(this.store.getState());
				}
				gameContainer.appendChild(game.canvas);
			} else {
				di.bind<HTMLElement | null>('phaser:container').toDynamicValue(() => gameContainer);
				di.get<IPhaserGameProvider>('phaser:game-provider')().then((result: Phaser.Game) => game = result);
			}

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
		console.log('PhaserViewComponent:componentWillUnmount', game);
		if (game) {
			if (this.props.keepInstanceOnRemove) {
				/** that probably should be pause @see https://github.com/photonstorm/phaser3-docs/issues/40 */
				game.loop.sleep();
			} else {
				game.destroy(true);
				game = null;
			}
			gameContainer = null;
		}

		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	public render(): any {
		console.log('PhaserViewComponent:render', this.state);
		return (<div className="phaser-view" ref={ this.bindContainer }>
			<ul className="menu-vertical">
				<li><a className={['btn', this.state.paused ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.togglePause}>{ __('Pause') }</a></li>
				<li><a className={['btn', this.state.mute ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.toggleMute}>{ __('Mute') }</a></li>
			</ul>
		</div>);
	}

	private bindContainer = (el: HTMLDivElement) => gameContainer = el;

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

export default hot(module)(connectToDI<IPhaserViewProps>(PhaserViewComponent));
