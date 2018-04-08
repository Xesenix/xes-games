import * as React from 'react';
import { hot } from 'react-hot-loader';

import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { MOVABLE_ASPECT } from 'lib/game/sokobana/aspects';

import './game-object.scss';

export interface IGameObjectComponentProps<T extends IGameObjectState> {
	object: IGameBoardObject<T>;
}

export interface IGameObjectComponentState {
}

class GameObjectComponent<T extends IGameObjectState> extends React.Component<IGameObjectComponentProps<T>, IGameObjectComponentState> {
	public render(): any {
		const { object } = this.props;
		const { type = 0 } = object;
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
