import * as React from 'react';
import { hot } from 'react-hot-loader';

import './game-tile.scss';

export interface IGameTileProps {
	state: number;
}

export interface IGameTileState {
}

class GameTileComponent extends React.Component<IGameTileProps, IGameTileState> {
	public shouldComponentUpdate({ state }) {
		return this.props.state !== state;
	}
	public render(): any {
		const v = this.props.state > 0 ? Math.floor(Math.log2(this.props.state >>> 3)) : 0;

		return (<div className="tile" data-state={v}>{v}</div>);
	}
}

export default hot(module)(GameTileComponent);
