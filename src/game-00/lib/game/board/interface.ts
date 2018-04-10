export interface IGameObjectState {
	alive: boolean;
	lifespan?: number;
	spawnFactoryId?: number;
	bodyFactoryId?: number;
	appearance: number;
	position: {
		x: number;
		y: number;
	};
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
	type: number;
	collisionGroup: number;
}

export interface IGameBoard<T extends IGameObjectState> {
	sizeX: number;
	sizeY: number;
	get(x: number, y: number, v: Array<IGameBoardObject<T>> | null): Array<IGameBoardObject<T>>;
	set(x: number, y: number, v: Array<IGameBoardObject<T>>): void;
	add(x: number, y: number, v: IGameBoardObject<T>): void;
	remove(x: number, y: number, v: IGameBoardObject<T>): void;
	clone(): IGameBoard<T>;
	tiles(): Array<{ x: number, y: number, v: Array<IGameBoardObject<T>> }>;
}
