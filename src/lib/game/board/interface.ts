export interface IGameObjectState {
	alive: boolean;
	collided?: boolean;
	lifespan?: number;
	spawnFactoryId?: symbol;
	bodyFactoryId?: symbol;
	collectableId?: symbol;
	keyItemId?: symbol;
	appearance: number;
	position: {
		x: number;
		y: number;
	};
	steps?: number;
}

export interface IMovableGameObjectState extends IGameObjectState {
	steps: number;
	speed: number;
	impact: number;
	/**
	 * Object velocity.
	 */
	n: { x: number; y: number; };
	direction: { x: number, y: number };
}

export interface IGameBoardObject<T extends IGameObjectState> {
	id: number;
	/**
	 * Some specific state id like alive, dead or something more complicated lik burning flying etc
	 */
	state: T;
	type: symbol;
	aspects: symbol[];
	collisionGroup: number;
}

export interface IGameBoard<T extends IGameObjectState> {
	sizeX: number;
	sizeY: number;
	get(x: number, y: number, v: IGameBoardObject<T>[] | null): IGameBoardObject<T>[];
	set(x: number, y: number, v: IGameBoardObject<T>[]): void;
	add(x: number, y: number, v: IGameBoardObject<T>): void;
	addUnique(x: number, y: number, v: IGameBoardObject<T>): boolean;
	remove(x: number, y: number, v: IGameBoardObject<T>): void;
	tiles(): { x: number, y: number, v: IGameBoardObject<T>[] }[];
}
