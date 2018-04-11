import * as React from 'react';
import { hot } from 'react-hot-loader';

import GameObjectComponent from 'components/game-object/game-object';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

import './game-tile.scss';

export interface IGameTileProps<T extends IGameObjectState> {
	objects: IGameBoardObject<T>[];
}

export interface IGameTileState {
}

class GameTileComponent<T extends IGameObjectState> extends React.Component<IGameTileProps<T>, IGameTileState> {
	public render(): any {
		return (<div className="tile">{
			this.props.objects.map(
				(o, index: number) => <GameObjectComponent key={index} object={o}/>,
			)
		}</div>);
	}
}

export default hot(module)(GameTileComponent);
