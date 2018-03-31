import * as React from 'react';
import { hot } from 'react-hot-loader';

import './game-object.scss';
import { IGameBoardObject } from '../../lib/game/board/interface';
import { MOVABLE_OBJECT } from '../../lib/game/sokobana/algorithm';

export interface IGameObjectComponentProps {
	object: IGameBoardObject;
}

export interface IGameObjectComponentState {
}

class GameObjectComponent extends React.Component<IGameObjectComponentProps, IGameObjectComponentState> {
	public render(): any {
		const { object } = this.props;
		const { v = { x: 0, y: 0 }, direction = { x: 0, y: 0 }, type = 0 } = object;
		const collided = (v.x !== direction.x || v.y !== direction.y) && (type & MOVABLE_OBJECT) > 0;

		return (
			<div className={`object ${collided ? 'collided' : ''}`} data-state={ object.appearance }>
				{ object.appearance }
				<span className="label">id: { object.id }</span>
				<span className="label">steps: { object.steps || 0 }</span>
			</div>
		);
	}
}

export default hot(module)(GameObjectComponent);
