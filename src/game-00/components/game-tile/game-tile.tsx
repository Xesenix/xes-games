import * as React from 'react';
import { hot } from 'react-hot-loader';

import './game-tile.scss';

export interface IGameTileProps {
	state: string;
}

export interface IGameTileState {
}

class GameTile extends React.Component<IGameTileProps, IGameTileState> {
	public render(): any {
		return (<div className="tile" data-state={this.props.state}></div>);
	}
}

export default hot(module)(GameTile);
