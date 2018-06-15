import * as React from 'react';
import { hot } from 'react-hot-loader';

import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';

import './game-view.scss';

export interface IGameViewProps { }
export interface IGameViewState {
	fullscreen: boolean;
	tab: 'configuration' | 'game';
}

class GameViewComponent extends React.Component<IGameViewProps, IGameViewState> {
	private fullScreenContainer?: HTMLDivElement;

	constructor(props) {
		super(props);
		this.state = {
			fullscreen: false,
			tab: 'game',
		};
	}

	public render(): any {
		const { tab = 'game', fullscreen } = this.state;

		return (<FullScreenComponent fullscreen={fullscreen}>
			<div className="panel panel-primary" ref={(el: HTMLDivElement) => this.fullScreenContainer = el}>
				<ul className="menu-vertical">
					{ tab === 'configuration' ? <li><a className="btn" onClick={this.backHandle}>Back</a></li> : null }
					{ tab === 'game' ? <li><a className="btn" onClick={this.openConfigurationHandle}>Configuration</a></li> : null }
					<li><a className="btn" onClick={this.toggleFullScreen}>Fullscreen</a></li>
				</ul>
				{ tab === 'configuration' ? <div key={'configuration'}>CONFIGURATION</div> : null }
				{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={true}/> : null }
			</div>
		</FullScreenComponent>);
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
}

export default hot(module)(GameViewComponent);
