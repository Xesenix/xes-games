import * as React from 'react';
import { hot } from 'react-hot-loader';

import GameTileComponent from 'components/game-tile/game-tile';
import { IGameBoard } from 'app/reducer/game-board';

import './game-board.scss';

export interface IGameBoardProps {
	board: IGameBoard;
}

export interface IGameBoardState {
}

class GameBoardComponent extends React.Component<IGameBoardProps, IGameBoardState> {
	public render(): any {
		const { board } = this.props;

		return (<div className="board" style={{ 'gridTemplateColumns': 'auto '.repeat(board.sizeX)}}>
			{ board.tiles().map(({ x, y, v }) => <GameTileComponent key={`${x},${y}`} state={ v }/>) }
		</div>);
	}
}

export default hot(module)(GameBoardComponent);
