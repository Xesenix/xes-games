import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

const LIFE_SPAN_ASPECT = Symbol.for('LIFE_SPAN_ASPECT');

@inject(['kill'])
export class LifespanSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[] }> {
	constructor(
		private kill = (obj: IGameBoardObject<T>) => {},
	) {	}

	public update(state: S): void {
		const { objects } = state;
		objects.forEach((obj) => {
			if (obj.aspects.includes(LIFE_SPAN_ASPECT)) {
				obj.state.lifespan = Math.max(0, (obj.state.lifespan || 0) - 1);
				if (obj.state.lifespan === 0) {
					this.kill(obj);
				}
			}
		});
	}
}
