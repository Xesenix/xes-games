export interface IGameBoardObject {
	id: number,
	appearance: number;
	x: number;
	y: number;
	type: number;
}

export interface IGameBoardMovableObject extends IGameBoardObject {
	/**
	 * Object velocity.
	 *
	 * @type { x: number; y: number; }
	 * @memberof IGameBoardMovableObject
	 */
	v: { x: number; y: number; };
}

export interface IGameBoard {
	sizeX: number;
	sizeY: number;
	get(x: number, y: number): IGameBoardObject[];
	set(x: number, y: number, v: IGameBoardObject[]): void;
	add(x: number, y: number, v: IGameBoardObject): void;
	remove(x: number, y: number, v: IGameBoardObject): void;
	clone(): IGameBoard;
	tiles(): { x: number, y: number, v: IGameBoardObject[] }[];
}
