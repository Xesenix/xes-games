import * as React from 'react';
import { hot } from 'react-hot-loader';

import GameObjectComponent from '../game-object/game-object';

import './game-tile.scss';
import { IGameBoardObject } from '../../lib/game/board/interface';

export interface IGameTileProps {
	objects: IGameBoardObject[];
}

export interface IGameTileState {
}

class GameTileComponent extends React.Component<IGameTileProps, IGameTileState> {
	public render(): any {
		return (<div className="tile">{
			this.props.objects.map(
				(o, index: number) => <GameObjectComponent key={index} object={o}/>
			)
		}</div>);
	}
}

export default hot(module)(GameTileComponent);
