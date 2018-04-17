import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY } from 'lib/game/system/map';
import ReplaceDeadWithBodySystem, { IMortalState } from 'lib/game/system/replace-dead-with-body';

export default class DeadBodiesSystem<T extends IGameObjectState, S extends IMortalState<T>> extends ReplaceDeadWithBodySystem<T, S> {
	constructor(
		mapSystem: MapSystem,
	) {
		super({
			[BROKEN_ARROW_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildBrokenArrow({ x, y }, { x: dx, y: dy }) ],
			[BROKEN_ROCK_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildBrokenRock({ x, y }, { x: dx, y: dy }) ],
		});
	}

	public update(state: S): void {
		super.update(state);

		// remove dead
		state.objects = state.objects.filter((obj: IGameBoardObject<T>) => {
			if (!obj.state.alive) {
				state.board.remove(obj.state.position.x, obj.state.position.y, obj);
				return false;
			}
			return true;
		});
	}
}
