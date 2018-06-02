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
	pause: boolean;
}

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	constructor(props) {
		super(props);
		this.state = { pause: false };
	}

	public componentDidMount() {
		console.log('PhaserViewComponent:componentDidMount', game, gameContainer);

		if (gameContainer) {
			if (game && game.isBooted) {
				game.loop.resume();
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
				game.loop.pause();
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
			<a onClick={this.togglePause}>Pause</a>
		</div>);
	}

	private bindContainer = (el: HTMLDivElement) => gameContainer = el;

	private togglePause = () => {
		if (game) {
			game.loop.pause();
		}
		this.setState({ pause: !this.state.pause });
	}
}

export default hot(module)(PhaserViewComponent);

// HMR: For changes in Phaser related classes we reload whole Phaser game instance
if (module.hot) {
	module.hot.accept('game-01/src/game.provider', () => {
		console.log('%c[HMR]: RELOAD PHASER INSTANCE', 'color: yellow');
		game.destroy(true);
		game = null;

		if (gameContainer) {
			game = gameProvider(gameContainer);
		}
	});
}
