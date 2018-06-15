import * as React from 'react';
import { hot } from 'react-hot-loader';

import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';
import { toggleFullscreen } from 'lib/fullscreen/fullscreen';

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

	public componentDidUpdate() {
		if (this.state.fullscreen && !!this.fullScreenContainer) {
			console.log('fullScreenContainer', this.fullScreenContainer);
			toggleFullscreen(this.fullScreenContainer);
		}
	}

	public render(): any {
		const { tab = 'game' } = this.state;

		return (<div className="panel panel-primary full-screen-container" ref={(el: HTMLDivElement) => this.fullScreenContainer = el}>
			<ul>
				{ tab === 'configuration' ? <li><a onClick={this.backHandle}>Back</a></li> : null }
				{ tab === 'game' ? <li><a onClick={this.openConfigurationHandle}>Configuration</a></li> : null }
				<li><a onClick={this.toggleFullScreen}>Fullscreen</a></li>
			</ul>
			{ tab === 'configuration' ? <div key={'configuration'}>CONFIGURATION</div> : null }
			{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={true}/> : null }
		</div>);
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
