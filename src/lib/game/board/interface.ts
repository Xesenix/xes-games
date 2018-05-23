export interface IGameObjectState {
	/**
	 * Describes if game object was destroyed. Its used by systems to determine if it should interact with other objects.
	 */
	alive: boolean;
	/**
	 * Describes if game object has collided with other object during movement resolving.
	 */
	collided?: boolean;
	/**
	 * Describes how many turns should game object exists before its alive property changes to false.
	 */
	lifespan?: number;
	/**
	 * Describes what game object class factory should be used to spawn game objects as children of this object.
	 * TODO: add spawnerId to spawned game objects
	 */
	spawnFactoryId?: symbol;
	/**
	 * Describes what game object factory should be used to replace this game object when its dead.
	 */
	bodyFactoryId?: symbol;
	/**
	 * Describes under what id should be put this object after being collected.
	 */
	collectableId?: symbol;
	/**
	 * Describes what item id is used as key to open this game object.
	 */
	keyItemId?: symbol;
	/**
	 * Describes what skin to use to draw this game object.
	 */
	appearance: number;
	/**
	 * Describes current board position for this game object.
	 */
	position: {
		x: number;
		y: number;
	};
	/**
	 * Number of iteration before object movement should be stopped resolving by MovementSystem.
	 * Works as maximum range of object movement.
	 * This one changes during resolving movement.
	 */
	steps?: number;
}

export interface IMovableGameObjectState extends IGameObjectState {
	/**
	 * Number of iteration before object movement should be stopped resolving by MovementSystem.
	 * Works as maximum range of object movement.
	 * This one changes during resolving movement.
	 */
	steps: number;
	/**
	 * Describes maximum of iterations before movement should be stopped.
	 * It is used to initialize steps on each turn beginning.
	 */
	speed: number;
	/**
	 * Game object velocity describes current movement direction durning movement resolving.
	 */
	n: { x: number; y: number; };
	/**
	 * Describes direction in which direction game object is facing it is used as initial movement direction on start of resolving movement.
	 */
	direction: { x: number, y: number };
}

export interface IGameBoardObject<T extends IGameObjectState> {
	/**
	 * Specific game object unique identifier.
	 */
	id: number;
	/**
	 * Set of variables describing current state of game object.
	 */
	state: T;
	/**
	 * Game object class needed for object factory to determine initial state and objects aspects and collision group.
	 */
	type: symbol;
	/**
	 * Aspects describe set of behaviors and system associations.
	 */
	aspects: symbol[];
	/**
	 * Game object association with collision group needed for resolving if it should collide with other objects.
	 */
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
