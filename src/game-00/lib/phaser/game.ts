import 'phaser';

export class Game extends Phaser.Game {
	public canvas: any;
	public parent: any;
	public mount(parent: any): void {
		parent.appendChild(this.canvas);
		this.parent = parent;
	}
}
