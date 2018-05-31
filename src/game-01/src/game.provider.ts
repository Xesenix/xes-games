
import MusicScene from 'lib/scene/music.scene';
import * as Phaser from 'phaser';

const gameProvider = (canvas: HTMLCanvasElement): Phaser.Game => {
	/** @see https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js */
	const fps: Phaser.FPSConfig = {
		min: 10,
		target: 30,
		forceSetTimeOut: false,
		deltaHistory: 10,
		panicMax: 120,
	};

	const loader: Phaser.LoaderConfig = {
	};

	const config: Phaser.GameConfig = {
		width: 800,
		height: 600,
		type: Phaser.CANVAS, // AUTO, CANVAS, WEBGL, HEADLESS
		canvas,
		disableContextMenu: true,
		fps,
		render: {
			antialias: false,
			pixelArt: true,
			autoResize: false,
			roundPixels: false,
			transparent: false,
			clearBeforeRender: false,
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			failIfMajorPerformanceCaveat: false,
			powerPreference: 'default', // 'high-performance', 'low-power' or 'default'
		},
		backgroundColor: 0x300000,
		callbacks: {
			preBoot: () => console.log('=== PRE BOOT'),
			postBoot: () => console.log('=== POST BOOT'),
		},
		loader,
		images: {
			// default: '',
			// missing: '',
		},
		scene: [ new MusicScene() ],
	};

	return new Phaser.Game(config);
}

export default gameProvider;
