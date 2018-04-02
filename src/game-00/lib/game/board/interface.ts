export interface IGameObjectState {
	alive: boolean;
	lifespan?: number;
	appearance: number;
	position: {
		x: number;
		y: number;
	};
}

export interface IMovableGameObjectState extends IGameObjectState {
	steps: number,
	speed: number,
	impact: number,
	/**
	 * Object velocity.
	 *
	 * @type { x: number; y: number; }
	 * @memberof IMovableGameObjectState
	 */
	n: { x: number; y: number; };
	direction: { x: number, y: number };
}

export interface IGameBoardObject<T extends IGameObjectState> {
	id: number,
	/**
	 * Some specific state id like alive, dead or something more complicated lik burning flying etc
	 */
	state: T;
	type: number;
	collisionGroups: number;

	commandAction(): void;
	update(gameObjects: IGameBoardObject<T>[], board: IGameBoard<T>): void;
}

export interface IGameBoardMovableObject<T extends IMovableGameObjectState> extends IGameBoardObject<T> {
	commandMoveUp(): void;
	commandMoveDown(): void;
	commandMoveLeft(): void;
	commandMoveRight(): void;
}

export interface IGameBoard<T extends IGameObjectState> {
	sizeX: number;
	sizeY: number;
	get(x: number, y: number, v: IGameBoardObject<T>[] | null): IGameBoardObject<T>[];
	set(x: number, y: number, v: IGameBoardObject<T>[]): void;
	add(x: number, y: number, v: IGameBoardObject<T>): void;
	remove(x: number, y: number, v: IGameBoardObject<T>): void;
	clone(): IGameBoard<T>;
	tiles(): { x: number, y: number, v: IGameBoardObject<T>[] }[];
}
