import * as React from 'react';
import { hot } from 'react-hot-loader';

import GameTile from 'components/game-tile/game-tile';

import './game-board.scss';

export interface IGameBoardProps {
	state: any[][];
	sizeX: number;
	sizeY: number;
}

export interface IGameBoardState {
}

class GameBoard extends React.Component<IGameBoardProps, IGameBoardState> {
	public render(): any {
		const { state, sizeX, sizeY } = this.props;

		return (<div className="board" style={{ 'gridTemplateColumns': 'auto '.repeat(sizeX)}}>
			{state.slice(0, sizeY).map((row, y) => row.slice(0, sizeX).map((v, x) => <GameTile key={`${x},${y}`} state={ v }/>))}
		</div>);
	}
}

export default hot(module)(GameBoard);
