import { Container } from 'inversify';
import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';

import { connectToDI } from 'game-01/src/di.context';
import { IPhaserGameProvider } from 'game-01/src/phaser/game.provider';
import './phaser-view.scss';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;
let di: Container | null;

export interface IPhaserViewProps {
	di?: Container | null;
	keepInstanceOnRemove: boolean;
}
export interface IPhaserViewState {
	mute: boolean;
	pause: boolean;
}

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	constructor(props) {
		super(props);
		this.state = {
			mute: false,
			pause: false,
		};
	}

	public componentDidMount() {
		di = this.props.di;
		console.log('PhaserViewComponent:componentDidMount', game, gameContainer);

		if (!!di && gameContainer) {
			if (game && game.isBooted) {
				game.loop.wake();
				gameContainer.appendChild(game.canvas);
			} else {
				di.bind<HTMLElement | null>('phaser:container').toDynamicValue(() => gameContainer);
				di.get<IPhaserGameProvider>('phaser:game-provider')().then((result: Phaser.Game) => game = result);
			}
		}
	}

	public componentDidUpdate() {
		if (game) {
			if (this.state.pause) {
				/** that probably should be pause @see https://github.com/photonstorm/phaser3-docs/issues/40 */
				game.loop.sleep();
				game.sound.mute = true;
			} else {
				game.loop.wake();
				game.sound.mute = this.state.mute;
			}
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
	}

	public render(): any {
		console.log('PhaserViewComponent:render', this.state);
		return (<div className="phaser-view" ref={ this.bindContainer }>
			<ul className="menu-vertical">
				<li><a className={['btn', this.state.pause ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.togglePause}>Pause</a></li>
				<li><a className={['btn', this.state.mute ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.toggleMute}>Mute</a></li>
			</ul>
		</div>);
	}

	private bindContainer = (el: HTMLDivElement) => gameContainer = el;

	private togglePause = () => {
		this.setState({ pause: !this.state.pause });
	}

	private toggleMute = () => {
		this.setState({ mute: !this.state.mute });
	}
}

export default hot(module)(connectToDI<IPhaserViewProps>(PhaserViewComponent));
