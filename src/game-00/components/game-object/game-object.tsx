import * as React from 'react';
import { hot } from 'react-hot-loader';

import './game-object.scss';
import { IGameBoardObject } from '../../lib/game/board/interface';

export interface IGameObjectComponentProps {
	object: IGameBoardObject;
}

export interface IGameObjectComponentState {
}

class GameObjectComponent extends React.Component<IGameObjectComponentProps, IGameObjectComponentState> {
	public render(): any {
		const { object } = this.props;
		const { v = { x: 0, y: 0 } } = object;

		return (
			<div className="object" data-state={ object.appearance } style={ { transform: `translate(${- v.x}0%, ${- v.y}0%)` } }>
				{ object.appearance }
				<span className="label">id: { object.id }</span>
			</div>
		);
	}
}

export default hot(module)(GameObjectComponent);
