import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { IOverlapableState } from 'lib/game/system/overlap';
import OverlapSystem from 'lib/game/system/overlap';

const ARROW_OBJECT_ASPECT = Symbol.for('ARROW_OBJECT_ASPECT');
const ARROW_TARGET_ASPECT = Symbol.for('ARROW_TARGET_ASPECT');

@inject(['kill'])
export default class ArrowSystem<T extends IGameObjectState, S extends IOverlapableState<T>> {
	private overlapSystem: OverlapSystem<T, S>;

	constructor(
		private kill: (target: IGameBoardObject) => void,
	) {
		this.overlapSystem = new OverlapSystem<T, S>(ARROW_OBJECT_ASPECT, ARROW_TARGET_ASPECT,
			(state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => {
				if (visitable.state.alive) {
					kill(visitor);
				}
			}
		);
	}

	public update(state: S): void {
		this.overlapSystem.update(state);
	}
}
