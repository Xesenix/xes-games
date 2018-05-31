import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';

import gameProvider from 'game-01/src/game.provider';

import './phaser-view.scss';

let game: Phaser.Game;
let gameCanvas: HTMLCanvasElement;

export interface IPhaserViewProps { }
export interface IPhaserViewState { }

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	constructor(props) {
		super(props);
	}

	public componentDidMount() {
		console.log('Game container', gameCanvas);

		if (!!gameCanvas) {
			game = gameProvider(gameCanvas);
		}
	}

	public render(): any {
		return <canvas className="phaser-view" ref={ this.bindContainer }></canvas>;
	}

	private bindContainer = (el: HTMLCanvasElement) => gameCanvas = el;
}

export default hot(module)(PhaserViewComponent);

// HMR: For changes in Phaser related classes we reload whole Phaser game instance
if (module.hot) {
	module.hot.accept('game-01/src/game.provider', () => {
		console.log('%c[HMR]: RELOAD PHASER INSTANCE', 'color: yellow');
		game.destroy(false);
		game = gameProvider(gameCanvas);
	});
 }
