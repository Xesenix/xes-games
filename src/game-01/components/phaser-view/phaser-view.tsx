import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';

import gameProvider from 'game-01/src/game.provider';

import './phaser-view.scss';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;

export interface IPhaserViewProps {
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
		console.log('PhaserViewComponent:componentDidMount', game, gameContainer);

		if (gameContainer) {
			if (game && game.isBooted) {
				game.loop.wake();
				gameContainer.appendChild(game.canvas);
			} else {
				game = gameProvider(gameContainer);
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
			<ul className="actions">
				<li><a className={['btn', this.state.pause ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.togglePause}>Pause</a></li>
				<li><a className={['btn', this.state.mute ? 'active' : null].filter((c) => !!c).join(' ')} onClick={this.toggleMute}>Mute</a></li>
			</ul>
		</div>);
	}

	private bindContainer = (el: HTMLDivElement) => gameContainer = el;

	private togglePause = () => {
		if (game) {
			// debugger;
			if (game.loop.running) {
				/** that probably should be pause @see https://github.com/photonstorm/phaser3-docs/issues/40 */
				game.loop.sleep();
				game.sound.mute = true;
			} else {
				game.loop.wake();
				game.sound.mute = this.state.mute;
			}
		}
		this.setState({ pause: !this.state.pause });
	}

	private toggleMute = () => {
		this.setState({ mute: !this.state.mute }, () => {
			if (game) {
				if (game.loop.running) {
					game.sound.mute = this.state.mute;
				}
			}
		});
	}
}

export default hot(module)(PhaserViewComponent);

// HMR: For changes in Phaser related classes we reload whole Phaser game instance
if (module.hot) {
	module.hot.accept('game-01/src/game.provider', () => {
		console.log('%c[HMR]: RELOAD PHASER INSTANCE', 'color: yellow');
		if (game) {
			game.destroy(true);
			game = null;
		}

		if (gameContainer) {
			game = gameProvider(gameContainer);
		}
	});
}
