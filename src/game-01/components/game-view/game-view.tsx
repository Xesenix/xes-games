import * as React from 'react';
import { hot } from 'react-hot-loader';

import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';

export interface IGameViewProps { }
export interface IGameViewState {
	tab: 'configuration' | 'game';
}

class GameViewComponent extends React.Component<IGameViewProps, IGameViewState> {
	constructor(props) {
		super(props);
		this.state = { tab: 'game' };
	}

	public render(): any {
		const { tab = 'game' } = this.state;

		return (<div className="panel panel-primary">
			<ul>
				{ tab === 'configuration' ? <li><a onClick={this.backHandle}>Back</a></li> : null }
				{ tab === 'game' ? <li><a onClick={this.openConfigurationHandle}>Configuration</a></li> : null }
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
}

export default hot(module)(GameViewComponent);
