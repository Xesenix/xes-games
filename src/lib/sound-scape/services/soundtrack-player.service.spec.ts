import { IAudioTrack } from 'lib/sound/interfaces';

import { IScheduledSoundtrack, ISoundSprite, ISoundtrack } from '../interfaces';

import { SoundtrackPlayer } from './soundtrack-player.service';
import { EventEmitter } from 'events';

// tslint:disable:max-classes-per-file

class MockAudioContext {
	public currentTime: number = 0;
}

class MockAudioTrack implements IAudioTrack {
	public mockedNode: any;
	public create = jasmine.createSpy('create').and.callFake(() => this.mockedNode);
	public playLoop = jasmine.createSpy('playLoop');
	public play = jasmine.createSpy('play');
	public stop = jasmine.createSpy('stop');
	public connect = jasmine.createSpy('connect');
	public getNode = jasmine.createSpy('getNode');
}

class EventEmitterMock {
	public emit = jasmine.createSpy('emit');
	public addListener = jasmine.createSpy('addListener');
	public prependListener = jasmine.createSpy('prependListener');
	public prependOnceListener = jasmine.createSpy('prependOnceListener');
	public removeListener = jasmine.createSpy('removeListener');
	public removeAllListeners = jasmine.createSpy('removeAllListeners');
	public setMaxListeners = jasmine.createSpy('setMaxListeners');
	public getMaxListeners = jasmine.createSpy('getMaxListeners');
	public listeners = jasmine.createSpy('listeners');
	public rawListeners = jasmine.createSpy('rawListeners');
	public eventNames = jasmine.createSpy('eventNames');
	public listenerCount = jasmine.createSpy('listenerCount');
	public on = jasmine.createSpy('on');
	public once = jasmine.createSpy('once');
}

describe('SoundtrackPlayer', () => {
	let service: SoundtrackPlayer;
	let music: MockAudioTrack;
	let context: MockAudioContext;
	let intro: ISoundSprite;
	let loop: ISoundSprite;
	let outro: ISoundSprite;
	let soundtrack: ISoundtrack;
	let em: EventEmitter;

	beforeEach(() => {
		em = new EventEmitterMock();
		context = new MockAudioContext();
		music = new MockAudioTrack();
		service = new SoundtrackPlayer(music, context, em);

		intro = {
			start: 10,
			end: 12,
			duration: 2,
		};
		loop = {
			start: 0,
			end: 4,
			duration: 4,
			interruptionStep: 2,
		};
		outro = {
			start: 4,
			end: 6,
			duration: 2,
		};
	});

	describe('.scheduleIntroAt()', () => {
		[0, 1000].forEach((contextCurrentTime) => describe(`audio context currentTime: ${contextCurrentTime}`, () => {
			beforeEach(() => {
				context.currentTime = contextCurrentTime;
			});

			[0, 100].forEach((when) => describe(`start offset: ${when}`, () => {
				describe('when intro duration is 0', () => {
					beforeEach(() => {
						intro = {
							start: 5,
							end: 5,
							duration: 0,
						};
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};
					});
					it('should not schedule intro', () => {
						expect((service.scheduleIntroAt(soundtrack, when) as any)).toBe(null);
					});
					it('should not emit soundtrack:schedule-changed event', () => {
						service.scheduleIntroAt(soundtrack, when);
						expect(em.emit).not.toHaveBeenCalled();
					});
				});

				describe('when intro duration is greater than 0', () => {
					beforeEach(() => {
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};

						music.mockedNode = {
							start: jasmine.createSpy('start'),
							stop: jasmine.createSpy('stop'),
						};
					});

					describe('returned intro', () => {
						it('should not be null', () => {
							expect((service.scheduleIntroAt(soundtrack, when) as any)).not.toBe(null);
						});

						it(`should start at specified offset (${when})`, () => {
							expect((service.scheduleIntroAt(soundtrack, when) as any).start).toBe(when);
						});

						it(`should end at specified offset (${when}) and intro duration`, () => {
							expect((service.scheduleIntroAt(soundtrack, when) as any).end).toBe(when + intro.duration);
						});

						it('should attach audio node to result', () => {
							expect((service.scheduleIntroAt(soundtrack, when) as any).node).not.toBeUndefined();
						});

						describe('returned audio node', () => {
							it('should not set loop to true', () => {
								expect((service.scheduleIntroAt(soundtrack, when) as any).node.loop).not.toBe(true);
							});
						});
					});

					it('should add scheduled segment to layer 0', () => {
						expect(service.layers[0]).toContain((service.scheduleIntroAt(soundtrack, when) as any));
					});

					it('should emit soundtrack:schedule-changed event', () => {
						service.scheduleIntroAt(soundtrack, when);
						expect(em.emit).toHaveBeenCalledWith('soundtrack:schedule-changed', service);
					});
				});
			}));
		}));
	});

	describe('.scheduleLoopAt()', () => {
		[0, 1000].forEach((contextCurrentTime) => describe(`audio context currentTime: ${contextCurrentTime}`, () => {
			beforeEach(() => {
				context.currentTime = contextCurrentTime;
			});

			[0, 100].forEach((when) => describe(`start offset: ${when}`, () => {
				describe('when loop duration is 0', () => {
					beforeEach(() => {
						loop = {
							start: 5,
							end: 5,
							duration: 0,
						};
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};
					});
					it('should not schedule loop', () => {
						expect((service.scheduleLoopAt(soundtrack, when) as any)).toBe(null);
					});
					it('should not emit soundtrack:schedule-changed event', () => {
						service.scheduleLoopAt(soundtrack, when);
						expect(em.emit).not.toHaveBeenCalled();
					});
				});

				describe('when loop duration is greater than 0', () => {
					beforeEach(() => {
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};

						music.mockedNode = {
							start: jasmine.createSpy('start'),
							stop: jasmine.createSpy('stop'),
						};
					});

					describe('returned loop', () => {
						it('should not be null', () => {
							expect((service.scheduleLoopAt(soundtrack, when) as any)).not.toBe(null);
						});

						it(`should start at specified offset (${when})`, () => {
							expect((service.scheduleLoopAt(soundtrack, when) as any).start).toBe(when);
						});

						describe('when requested duration is 0', () => {
							it(`should not set end`, () => {
								expect((service.scheduleLoopAt(soundtrack, when) as any).end).toBeUndefined();
							});
						});

						describe('when requested duration is grater than 0', () => {
							it(`should end at specified offset (${when}) and rounded down multiplication of loop interruptionStep`, () => {
								expect((service.scheduleLoopAt(soundtrack, when, 4.2) as any).end).toBe(when + 4);
							});
							it(`should end at specified offset (${when}) and rounded up multiplication of loop interruptionStep`, () => {
								expect((service.scheduleLoopAt(soundtrack, when, 2.6) as any).end).toBe(when + 4);
							});
							it(`should not start if there is not enough time`, () => {
								expect((service.scheduleLoopAt(soundtrack, when, 0.1) as any)).toBe(null);
							});
						});

						it(`should set result interruptionStep to loop interruptionStep`, () => {
							expect((service.scheduleLoopAt(soundtrack, when) as any).interruptionStep).toBe(loop.interruptionStep);
						});

						it('should attach audio node to result', () => {
							expect((service.scheduleLoopAt(soundtrack, when) as any).node).not.toBeUndefined();
						});

						describe('returned audio node', () => {
							it('should set loop to true', () => {
								expect((service.scheduleLoopAt(soundtrack, when) as any).node.loop).toBe(true);
							});

							it('should set loopStart', () => {
								expect((service.scheduleLoopAt(soundtrack, when) as any).node.loopStart).toBe(loop.start);
							});

							it('should set loopEnd', () => {
								expect((service.scheduleLoopAt(soundtrack, when) as any).node.loopEnd).toBe(loop.end);
							});
						});
					});

					it('should add scheduled segment to layer 0', () => {
						expect(service.layers[0]).toContain((service.scheduleLoopAt(soundtrack, when) as any));
					});

					it('should emit soundtrack:schedule-changed event', () => {
						service.scheduleLoopAt(soundtrack, when);
						expect(em.emit).toHaveBeenCalledWith('soundtrack:schedule-changed', service);
					});
				});
			}));
		}));
	});

	describe('.scheduleOutroAt()', () => {
		[0, 1000].forEach((contextCurrentTime) => describe(`audio context currentTime: ${contextCurrentTime}`, () => {
			beforeEach(() => {
				context.currentTime = contextCurrentTime;
			});

			[0, 100].forEach((when) => describe(`start offset: ${when}`, () => {
				describe('when outro duration is 0', () => {
					beforeEach(() => {
						outro = {
							start: 5,
							end: 5,
							duration: 0,
						};
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};
					});
					it('should not schedule outro', () => {
						expect((service.scheduleOutroAt(soundtrack, when) as any)).toBe(null);
					});
					it('should not emit soundtrack:schedule-changed event', () => {
						service.scheduleOutroAt(soundtrack, when);
						expect(em.emit).not.toHaveBeenCalled();
					});
				});

				describe('when outro duration is greater than 0', () => {
					beforeEach(() => {
						soundtrack = {
							key: 'soundtrack',
							name: 'idle',
							intro,
							loop,
							outro,
						};

						music.mockedNode = {
							start: jasmine.createSpy('start'),
							stop: jasmine.createSpy('stop'),
						};
					});

					describe('returned outro', () => {
						it('should not be null', () => {
							expect((service.scheduleOutroAt(soundtrack, when) as any)).not.toBe(null);
						});

						it(`should start at specified offset (${when})`, () => {
							expect((service.scheduleOutroAt(soundtrack, when) as any).start).toBe(when);
						});

						it(`should end at specified offset (${when}) and outro duration`, () => {
							expect((service.scheduleOutroAt(soundtrack, when) as any).end).toBe(when + outro.duration);
						});

						it('should attach audio node to result', () => {
							expect((service.scheduleOutroAt(soundtrack, when) as any).node).not.toBeUndefined();
						});

						describe('returned audio node', () => {
							it('should not set loop to true', () => {
								expect((service.scheduleOutroAt(soundtrack, when) as any).node.loop).not.toBe(true);
							});
						});
					});

					it('should add scheduled segment to layer 0', () => {
						expect(service.layers[0]).toContain((service.scheduleOutroAt(soundtrack, when) as any));
					});

					it('should emit soundtrack:schedule-changed event', () => {
						service.scheduleOutroAt(soundtrack, when);
						expect(em.emit).toHaveBeenCalledWith('soundtrack:schedule-changed', service);
					});
				});
			}));
		}));
	});

	describe('.scheduleAfterLast()', () => {
		// TODO: add tests
	});

	describe('.scheduleNext()', () => {
		// TODO: add tests
	});

	describe('.clearSoundtracksAfter()', () => {
		// TODO: add tests
	});

	describe('.getLastScheduledSoundtrack()', () => {
		it('should return null when schedule queue is empty', () => {
			expect(service.getLastScheduledSoundtrack()).toBe(null);
		});

		describe('when scheduled queue is not empty', () => {
			let soundtrackA: ISoundtrack;
			let soundtrackB: ISoundtrack;

			beforeEach(() => {
				soundtrackA = {
					key: 'soundtrack',
					name: 'A',
					intro,
					loop,
					outro,
				};

				soundtrackB = {
					key: 'soundtrack',
					name: 'B',
					intro,
					loop,
					outro,
				};

				music.mockedNode = {
					start: jasmine.createSpy('start'),
					stop: jasmine.createSpy('stop'),
				};
			});

			it('should return last scheduled soundtrack', () => {
				service.scheduleAfterLast(soundtrackA, 10);
				expect(service.getLastScheduledSoundtrack().soundtrack).toBe(soundtrackA);
				service.scheduleAfterLast(soundtrackB, 15);
				expect(service.getLastScheduledSoundtrack().soundtrack).toBe(soundtrackB);
			});
		});
	});

	describe('.getCurrentScheduledSoundtrack()', () => {
		it('should return null when schedule queue is empty', () => {
			expect(service.getCurrentScheduledSoundtrack()).toEqual([]);
		});

		describe('when scheduled queue is not empty', () => {
			let soundtrackA: ISoundtrack;
			let soundtrackB: ISoundtrack;

			beforeEach(() => {
				soundtrackA = {
					key: 'soundtrack',
					name: 'A',
					intro,
					loop,
					outro,
				};

				soundtrackB = {
					key: 'soundtrack',
					name: 'B',
					intro,
					loop,
					outro,
				};

				music.mockedNode = {
					start: jasmine.createSpy('start'),
					stop: jasmine.createSpy('stop'),
				};
			});

			it('should return current scheduled soundtrack', () => {
				service.scheduleAfterLast(soundtrackA, 10);
				service.scheduleAfterLast(soundtrackB, 15);
				context.currentTime = 0;
				expect(service.getCurrentScheduledSoundtrack()[0].soundtrack.name).toBe(soundtrackA.name);
				context.currentTime = 15; // just before next
				expect(service.getCurrentScheduledSoundtrack()[0].soundtrack.name).toBe(soundtrackA.name);
				context.currentTime = 16; // after 2 intro + 12 loop + 2 outro
				expect(service.getCurrentScheduledSoundtrack()[0].soundtrack.name).toBe(soundtrackB.name);
				context.currentTime = 35; // just before next
				expect(service.getCurrentScheduledSoundtrack()[0].soundtrack.name).toBe(soundtrackB.name);
				context.currentTime = 36; // after 2 intro + 16 loop + 2 outro
				expect(service.getCurrentScheduledSoundtrack()).toEqual([]);
			});
		});
	});
});
