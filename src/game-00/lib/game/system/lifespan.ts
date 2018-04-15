import { inject } from 'lib/di';
import { LIFE_SPAN_ASPECT } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

@inject(['kill'])
export default class LifespanSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[] }> {
	constructor(
		private kill = (obj: IGameBoardObject<T>) => {},
	) {	}

	public update(state: S): void {
		const { objects } = state;
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
