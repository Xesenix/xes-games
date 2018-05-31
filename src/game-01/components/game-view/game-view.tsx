import * as React from 'react';
import { hot } from 'react-hot-loader';

import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';

export interface IGameViewProps { }
export interface IGameViewState { }

class GameViewComponent extends React.Component<IGameViewProps, IGameViewState> {
	public render(): any {
		return (<div className="panel panel-primary">
			<PhaserViewComponent/>
		</div>);
	}
}

export default hot(module)(GameViewComponent);
