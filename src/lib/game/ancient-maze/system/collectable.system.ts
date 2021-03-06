import { injectable } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { IOverlapableState, OverlapSystem } from 'lib/game/system/overlap.system';

export interface ICollectableState<T extends IGameObjectState> extends IOverlapableState<T> {
	objects: IGameBoardObject<T>[];
	initialCollectableCount: { [key: number]: number };
	collected: { [key: number]: number };
}

const COLLECTABLE_ASPECT = Symbol.for('COLLECTABLE_ASPECT');
const COLLECTOR_ASPECT = Symbol.for('COLLECTOR_ASPECT');

@injectable()
export class CollectableSystem<T extends IGameObjectState, S extends ICollectableState<T>> {
	private overlapSystem: OverlapSystem<T, S>;

	constructor() {
		this.overlapSystem = new OverlapSystem<T, S>(COLLECTABLE_ASPECT, COLLECTOR_ASPECT,
			(state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => {
				if (visitable.state.alive) {
					const { collectableId = 0 } = visitable.state;
					state.collected[collectableId] ++;
					visitable.state.alive = false;
				}
			},
		);
	}

	public onLevelInit(state: S): void {
		state.objects.forEach((obj: IGameBoardObject<T>) => {
			if (obj.aspects.includes(COLLECTABLE_ASPECT)) {
				const { collectableId = 0 } = obj.state;
				state.initialCollectableCount[collectableId] ++;
			}
		});
	}

	public update(state: S): void {
		this.overlapSystem.update(state);
	}
}
