import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { CollisionSystem } from 'lib/game/system/collision';

const ROCK_OBJECT_ASPECT = Symbol.for('ROCK_OBJECT_ASPECT');
const ROCK_TARGET_ASPECT = Symbol.for('ROCK_TARGET_ASPECT');

@inject(['kill', 'collision-system'])
export default class RockSystem<T extends IGameObjectState> {
	constructor(
		private kill: (target: IGameBoardObject) => void,
		private collisionSystem: CollisionSystem,
	) {
		this.collisionSystem.listenToCollision(this.onCollision.bind(this));
	}

	private onCollision(source: IGameBoardObject<T>, target: IGameBoardObject<T>): void {
		if (source.aspects.includes(ROCK_OBJECT_ASPECT) && !!target && target.aspects.includes(ROCK_TARGET_ASPECT)) {
			this.kill(target);
		}
	}
}
