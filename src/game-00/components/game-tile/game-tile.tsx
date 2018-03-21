import * as React from 'react';
import { hot } from 'react-hot-loader';

import './game-tile.scss';

export interface IGameTileProps {
	state: { x: number, y: number, v: number };
}

export interface IGameTileState {
}

class GameTile extends React.Component<IGameTileProps, IGameTileState> {
	public shouldComponentUpdate({ state }) {
		return this.props.state.v !== state.v;
	}
	public render(): any {
		const { x, y, v } = this.props.state;

		return (<div className="tile" data-state={v}>{v}<span className="label">{x},{y}</span></div>);
	}
}

export default hot(module)(GameTile);
