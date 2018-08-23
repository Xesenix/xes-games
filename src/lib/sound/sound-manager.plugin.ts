import { Store } from 'redux';
// tslint:disable:max-classes-per-file
export interface ISoundConfigurationState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	paused: boolean;
}

export interface ISoundManager {
	loader?: Phaser.Loader.LoaderPlugin;
	getAudioAsset(key: string): Promise<AudioBufferSourceNode>;
	preloadAudioAsset(key: string, src: string): Promise<AudioBuffer>;
	playFxSound(key: string): Promise<AudioBufferSourceNode>;
	playLoop(key: string): Promise<AudioBufferSourceNode>;
	stopSound(key: string): Promise<AudioBufferSourceNode>;
}

export interface ISoundManagerPlugin<T extends ISoundConfigurationState> extends Phaser.Plugins.BasePlugin {
	store: Store<T>;
}

export const soundManagerPluginFactory = <T extends ISoundConfigurationState>(store: Store, context: AudioContext) =>
class SoundManagerPlugin extends Phaser.Plugins.BasePlugin implements ISoundManagerPlugin<T>, ISoundManager {
	public store: Store<T> = store;
	public loader?: Phaser.Loader.LoaderPlugin;
	private unsubscribe: any;
	private context = context;
	private audioNodes = {};
	private audioBufferPromise = {};
	private ready?: () => void;
	private readyPromise = new Promise((resolve) => {
		this.ready = resolve;
	});

	// graph
	private masterGain?: GainNode;
	private musicGain?: GainNode;
	private soundtrackAutomationGain?: GainNode;
	private soundtrackGain?: GainNode;
	private effectsGain?: GainNode;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('SoundManagerPlugin:constructor');
	}

	public start(): void {
		console.log('SoundManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);

		this.createNodes();
		this.syncWithState();

		if (!!this.ready) {
			this.ready();
		}
	}

	public getAudioAsset(key: string): Promise<AudioBufferSourceNode> {
		const source = this.getAudioNode(key);

		if (!!this.audioBufferPromise[key]) {
			return this.audioBufferPromise[key].then((buffer: AudioBuffer) => {
				// add sound buffer to source node
				if (!source.buffer) {
					source.buffer = buffer;
				}
				return source;
			});
		}

		return Promise.reject(`No audio asset for key: ${key}`);
	}

	public preloadAudioAsset(key: string, url: string): Promise<AudioBuffer> {
		if (!this.audioBufferPromise[key]) {
			this.audioBufferPromise[key] = this.loadSoundViaLoader(key, url);
		}

		return this.audioBufferPromise[key];
	}

	public attachToMusicNode = (source: AudioBufferSourceNode): AudioBufferSourceNode => {
		if (!!this.soundtrackGain) {
			source.connect(this.soundtrackGain);
		}

		return source;
	}

	public attachToFxSoundNode = (source: AudioBufferSourceNode): AudioBufferSourceNode => {
		if (!!this.effectsGain) {
			source.connect(this.effectsGain);
		}

		return source;
	}

	public playFxSound(key: string): Promise<AudioBufferSourceNode> {
		return this.getAudioAsset(key)
			.then(this.attachToFxSoundNode)
			.then((source: AudioBufferSourceNode) => {
				source.loop = false;
				source.start(0, 0);

				// fire and forget
				this.audioNodes[key] = null;

				return source;
			});
	}

	public stopSound(key: string): Promise<AudioBufferSourceNode> {
		return this.getAudioAsset(key)
			.then((source: AudioBufferSourceNode) => {
				source.stop();

				this.audioNodes[key] = null;

				return source;
			});
	}

	public playLoop(key: string): Promise<AudioBufferSourceNode> {
		return this.getAudioAsset(key)
			.then(this.attachToMusicNode)
			.then((source: AudioBufferSourceNode) => {
				source.loop = true;
				source.start(0, 0);

				return source;
			});
	}


	/**
	 * Load sound using phaser loader.
	 */
	public loadSoundViaLoader(key: string, url: string): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			if (this.loader) {
				this.loader.addFile(new Phaser.Loader.FileTypes.AudioFile(this.loader, {
					key,
					context: this.context,
					xhrSettings: {
						responseType: 'arraybuffer',
					},
				}, {
					type: 'audio',
					url,
				}));
				this.loader.addListener('complete', () => {
					resolve(this.game.cache.audio.get(key));
				});
			}
		});
	}

	/**
	 * Load sound without need to use phaser loader.
	 */
	public loadSound(src: string): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			const request = new XMLHttpRequest();
			request.open('GET', src, true);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				this.decodeAudio(request.response).then(resolve);
			};
			request.send();
		});
	}

	public decodeAudio(buffer): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			this.readyPromise.then(() => {
				this.context.decodeAudioData(buffer, resolve);
			});
		});
	}

	public stop() {
		console.log('SoundManagerPlugin:stop');
		this.unsubscribe();
		this.context.close();
	}

	private createNodes() {
		this.masterGain = this.context.createGain();
		this.masterGain.connect(this.context.destination);

		// music branch
		this.musicGain = this.context.createGain();
		this.musicGain.connect(this.masterGain);

		this.soundtrackAutomationGain = this.context.createGain();
		this.soundtrackAutomationGain.connect(this.musicGain);

		this.soundtrackGain = this.context.createGain();
		this.soundtrackGain.connect(this.soundtrackAutomationGain);

		// effects branch
		this.effectsGain = this.context.createGain();
		this.effectsGain.connect(this.masterGain);
	}

	private getAudioNode(key: string): AudioBufferSourceNode {
		console.log('getAudioNode', key, this.audioNodes);
		if (!this.audioNodes[key]) {
			const source = this.context.createBufferSource();
			this.audioNodes[key] = source;
		}

		return this.audioNodes[key];
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		console.log('UIManagerPlugin:syncWithState', state);

		const mute = state.paused || state.mute;

		if (!!this.context) {
			if (mute) {
				this.context.suspend();
			} else {
				this.context.resume();
			}
		}

		if (!!this.masterGain) {
			this.masterGain.gain.value = state.volume;
		}

		if (!!this.musicGain) {
			this.musicGain.gain.value = state.musicMuted ? 0 : state.musicVolume;
		}

		if (!!this.effectsGain) {
			this.effectsGain.gain.value = state.effectsMuted ? 0 : state.effectsVolume;
		}
	}
};
