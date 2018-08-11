import { EventEmitter } from 'events';
import { Container } from 'inversify';

export interface IApplication extends Container {
	eventManager: EventEmitter;

	boot: () => Promise<IApplication>;
}
