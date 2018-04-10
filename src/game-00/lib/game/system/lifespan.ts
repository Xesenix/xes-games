import { inject } from 'lib/di';
import { IGameBoardObject } from 'lib/game/board/interface';
import { IGameBoard } from 'lib/game/sokobana/algorithm';
import { LIFE_SPAN_ASPECT } from 'lib/game/sokobana/aspects';

@inject(['kill'])
export default class LifespanSystem {
	constructor(
		private kill = (obj: IGameBoardObject) => {},
	) {	}

	public update(objects: IGameBoardObject[], board: IGameBoard): void {
		objects.forEach((obj) => {
			if ((obj.type & LIFE_SPAN_ASPECT) === LIFE_SPAN_ASPECT) {
				obj.state.lifespan = Math.max(0, obj.state.lifespan - 1);
				if (obj.state.lifespan === 0) {
					this.kill(obj);
				}
			}
		});
	}
}
