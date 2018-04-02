import { inject } from 'lib/di';
import { IGameBoardObject } from 'lib/game/board/interface';
import { LIFE_SPAN_ASPECT } from 'lib/game/sokobana/aspects';
import { IGameBoard } from 'lib/game/sokobana/algorithm';

@inject(['kill'])
export default class LifespanSystem {
	constructor(
		private kill = (obj: IGameBoardObject) => {},
	) {	}

	public update(objects: IGameBoardObject[], board: IGameBoard) {
		console.log('====== LifespanSystem:update');
		objects.forEach((obj) => {
			if ((obj.type & LIFE_SPAN_ASPECT) === LIFE_SPAN_ASPECT) {
				console.log('LifespanSystem:update', obj);
				obj.state.lifespan = Math.max(0, obj.state.lifespan - 1);
				if (obj.state.lifespan === 0) {
					this.kill(obj);
				}
			}
		});
	}
}
