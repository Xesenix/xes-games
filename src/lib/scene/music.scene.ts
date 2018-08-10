export class MusicScene extends Phaser.Scene {
	private soundtrack?: Phaser.Sound.BaseSound;
	private label?: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'music',
		});
	}

	public preload(): void {
		this.load.audio('soundtrack', [
			'assets/soundtrack.wav',
		]);
	}

	public create(): void {
		this.soundtrack = this.sound.add('soundtrack');

		this.soundtrack.play();
		this.soundtrack.source.loop = true;

		this.label = this.add.text(400, 300, '', { font: '64px Consolas', fill: '#ffffff' });
		this.label.setOrigin(0.5, 0.5);
	}

	public destroy(): void {
		if (this.soundtrack) {
			this.soundtrack.destroy();
		}
	}

	public update(time: number, delta: number): void {
		this.label.setText(`total time: ${(time / 1000).toFixed(0)}s\ndelta: ${delta.toFixed(2)}ms`);
	}
}
