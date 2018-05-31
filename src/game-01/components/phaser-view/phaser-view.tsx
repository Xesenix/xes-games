import Phaser from 'phaser';
import * as React from 'react';
import { hot } from 'react-hot-loader';

import gameProvider from 'game-01/src/game.provider';

import './phaser-view.scss';

let game: Phaser.Game;

export interface IPhaserViewProps { }
export interface IPhaserViewState { }

class PhaserViewComponent extends React.Component<IPhaserViewProps, IPhaserViewState> {
	public gameCanvas?: HTMLCanvasElement;

	constructor(props) {
		super(props);
	}

	public componentDidMount() {
		console.log('Game container', this.gameCanvas);

		if (!!this.gameCanvas) {
			game = gameProvider(this.gameCanvas);
		}
	}

	public render(): any {
		return <canvas className="phaser-view" ref={ this.bindContainer }></canvas>;
	}

	private bindContainer = (el: HTMLCanvasElement) => this.gameCanvas = el;
}

export default hot(module)(PhaserViewComponent);
