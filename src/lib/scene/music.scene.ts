import * as Phaser from 'phaser';

export default class MusicScene extends Phaser.Scene {
	private soundtrack?: Phaser.Sound.BaseSound;
	private label?: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'music',
		});
	}

	public preload() {
		console.log('=== PRELOAD MUSIC');
		this.load.audio('soundtrack', [
			'assets/soundtrack.ogg',
		]);
	}

	public create() {
		console.log('=== CREATE MUSIC');
		this.soundtrack = this.sound.add('soundtrack');
		this.soundtrack.play('', { loop: true });

		this.label = this.add.text(400, 300, '', { font: '64px Consolas', fill: '#ffffff' });
		this.label.setOrigin(0.5, 0.5);

		this.input.keyboard.on('keydown_P', () => {
			if (!this.scene.isActive('music')) {
				this.scene.resume('music');
			} else {
				this.scene.pause('music');
			}
		});
	}

	public destroy() {
		if (this.soundtrack) {
			this.soundtrack.destroy();
		}
	}

	public update(time: number, delta: number) {
		this.label.setText(`total time: ${(time / 1000).toFixed(0)}s\ndelta: ${delta.toFixed(2)}ms`);
		console.log('update', delta.toFixed(0));
	}
}
