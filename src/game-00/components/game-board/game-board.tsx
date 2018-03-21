import * as React from 'react';
import { hot } from 'react-hot-loader';

import GameTile from 'components/game-tile/game-tile';

import './game-board.scss';

export interface IGameBoardProps {
	state: string[][];
}

export interface IGameBoardState {
}

class GameBoard extends React.Component<IGameBoardProps, IGameBoardState> {
	public render(): any {

		return (<div className="board">
			{this.props.state.map((row, y) => row.map((v, x) => <GameTile key={`${x},${y}`} state={ v }/>))}
		</div>);
	}
}

export default hot(module)(GameBoard);
