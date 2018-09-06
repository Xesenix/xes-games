import { ContainerModule, interfaces } from 'inversify';

import { IPhaserGameProvider, PhaserGameProvider } from './game.provider';

export const PhaserGameModule = () => new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
	bind<IPhaserGameProvider>('phaser:game-provider').toProvider(PhaserGameProvider);
});
