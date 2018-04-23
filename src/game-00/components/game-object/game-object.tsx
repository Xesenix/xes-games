import * as React from 'react';
import { hot } from 'react-hot-loader';

import { IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';

import './game-object.scss';

export interface IGameObjectComponentProps<T extends (IGameObjectState | IMovableGameObjectState)> {
	object: IGameBoardObject<T>;
}

export interface IGameObjectComponentState {
}

class GameObjectComponent<T extends (IGameObjectState | IMovableGameObjectState)>
extends React.Component<IGameObjectComponentProps<T>, IGameObjectComponentState> {
	public render(): any {
		const { object } = this.props;
		const { collided = false, steps = 0, lifespan = 0 } = object.state;

		return (
			<div className={`object ${collided ? 'collided' : ''}`} data-state={ object.state.appearance }>
				{ object.state.appearance }
				<span className="label">id: { object.id }</span>
				<span className="label">steps: { steps || 0 }</span>
				<span className="label">lifespan: { lifespan || 0 }</span>
			</div>
		);
	}
}

export default hot(module)(GameObjectComponent);
