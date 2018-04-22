import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { CollisionSystem } from 'lib/game/system/collision.system';
import OverlapSystem, { IOverlapableState } from 'lib/game/system/overlap.system';

const ARROW_OBJECT_ASPECT = Symbol.for('ARROW_OBJECT_ASPECT');
const ARROW_TARGET_ASPECT = Symbol.for('ARROW_TARGET_ASPECT');
const COLLISION_ASPECT = Symbol.for('COLLISION_ASPECT');

@inject(['kill', 'collision-system'])
export default class ArrowSystem<T extends IGameObjectState, S extends IOverlapableState<T>> {
	private overlapSystem: OverlapSystem<T, S>;

	constructor(
		private kill: (target: IGameBoardObject) => void,
		private collisionSystem: CollisionSystem,
	) {
		this.overlapSystem = new OverlapSystem<T, S>(ARROW_OBJECT_ASPECT, ARROW_TARGET_ASPECT,
			(state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => {
				if (visitable.state.alive) {
					kill(visitable);
					kill(visitor);
				}
			}
		);

		this.collisionSystem.listenToCollision(this.onCollision.bind(this));
	}

	private onCollision(source: IGameBoardObject<T>, target: IGameBoardObject<T>): void {
		if (source.aspects.includes(ARROW_OBJECT_ASPECT) && !!target && target.aspects.includes(COLLISION_ASPECT)) {
			this.kill(source);
		}
	}

	public update(state: S): void {
		this.overlapSystem.update(state);
	}
}
