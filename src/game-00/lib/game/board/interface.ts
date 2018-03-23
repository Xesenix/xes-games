export interface IGameBoard {
	sizeX: number;
	sizeY: number;
	get(x: number, y: number): number;
	set(x: number, y: number, v: number): void;
	clone(): IGameBoard;
	tiles(): { x: number, y: number, v: number }[];
}
