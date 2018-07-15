import { inject } from 'lib/di';
import { ObjectFactory } from 'lib/game/ancient-maze/object-factory';
import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

const ARROW_CANNON_TYPE = Symbol.for('ARROW_CANNON_TYPE');
const BOX_TYPE = Symbol.for('BOX_TYPE');
const EXIT_TYPE = Symbol.for('EXIT_TYPE');
const WALL_TYPE = Symbol.for('WALL_TYPE');
const KEY_TYPE = Symbol.for('KEY_TYPE');
const PLAYER_TYPE = Symbol.for('PLAYER_TYPE');
const ROCK_TYPE = Symbol.for('ROCK_TYPE');

@inject(['game-objects-factory'])
export class MapSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
	constructor(
		private builder: ObjectFactory<T, S>,
	) {}

	public load(state: S): void {
		for (let i = 0; i < state.board.sizeX; i ++) {
			this.builder.build(state, WALL_TYPE, { x: i, y: 0 });
			this.builder.build(state, WALL_TYPE, { x: i, y: state.board.sizeY - 1 });
		}

		for (let i = 2; i < state.board.sizeY - 1; i ++) {
			this.builder.build(state, WALL_TYPE, { x: 0, y: i });
			this.builder.build(state, WALL_TYPE, { x: state.board.sizeX - 1, y: i });
		}

		this.builder.build(state, WALL_TYPE, { x: 0, y: 1 });

		this.builder.build(state, WALL_TYPE, { x: 1, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 1, y: 4 });
		this.builder.build(state, WALL_TYPE, { x: 1, y: 6 });

		// this.builder.build(state, WALL_TYPE, { x: 3, y: 1 });
		this.builder.build(state, WALL_TYPE, { x: 3, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 3, y: 4 });
		this.builder.build(state, WALL_TYPE, { x: 3, y: 6 });
		this.builder.build(state, WALL_TYPE, { x: 3, y: 7 });

		this.builder.build(state, WALL_TYPE, { x: 5, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 5, y: 3 });
		this.builder.build(state, WALL_TYPE, { x: 5, y: 4 });
		this.builder.build(state, WALL_TYPE, { x: 5, y: 5 });
		this.builder.build(state, WALL_TYPE, { x: 5, y: 6 });

		this.builder.build(state, WALL_TYPE, { x: 6, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 6, y: 6 });

		this.builder.build(state, WALL_TYPE, { x: 7, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 7, y: 4 });
		this.builder.build(state, WALL_TYPE, { x: 7, y: 5 });
		this.builder.build(state, WALL_TYPE, { x: 7, y: 6 });

		this.builder.build(state, WALL_TYPE, { x: 8, y: 2 });

		this.builder.build(state, WALL_TYPE, { x: 9, y: 2 });
		this.builder.build(state, WALL_TYPE, { x: 9, y: 4 });
		this.builder.build(state, WALL_TYPE, { x: 9, y: 5 });
		this.builder.build(state, WALL_TYPE, { x: 9, y: 6 });
		this.builder.build(state, WALL_TYPE, { x: 9, y: 7 });

		this.builder.build(state, WALL_TYPE, { x: 10, y: 7 });

		this.builder.build(state, PLAYER_TYPE, { x: 1, y: 3 });
		this.builder.build(state, ROCK_TYPE, { x: 1, y: 1 });
		this.builder.build(state, ROCK_TYPE, { x: 1, y: 7 });
		this.builder.build(state, ROCK_TYPE, { x: 8, y: 7 });
		this.builder.build(state, BOX_TYPE, { x: 3, y: 3 });
		this.builder.build(state, BOX_TYPE, { x: 8, y: 5 });
		this.builder.build(state, BOX_TYPE, { x: 8, y: 6 });

		this.builder.build(state, ARROW_CANNON_TYPE, { x: 11, y: 1 }, { x: -1, y: 0 });
		this.builder.build(state, ARROW_CANNON_TYPE, { x: 3, y: 1 }, { x: 1, y: 0 });

		this.builder.build(state, EXIT_TYPE, { x: 10, y: 6 });
		this.builder.build(state, KEY_TYPE, { x: 6, y: 5 });
		this.builder.build(state, KEY_TYPE, { x: 1, y: 5 });

		// filter walls from object list
		state.objects = state.objects.filter((obj: IGameBoardObject<T>) => {
			if (obj.type !== WALL_TYPE) {
				return true;
			}

			state.board.add(obj.state.position.x, obj.state.position.y, obj);

			return false;
		});
	}

	public export() {

	}
}
