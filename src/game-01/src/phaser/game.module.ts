import { ContainerModule, interfaces } from 'inversify';

import { IPhaserGameProvider, PhaserGameProvider } from './game.provider';
// import { ConfigurePhaserState, IPhaserSetupProvider } from './phaser-configure-state';

export const PhaserGameModule = () => new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
	bind<IPhaserGameProvider>('phaser:game-provider').toProvider(PhaserGameProvider);
	// bind<IPhaserSetupProvider>('phaser:setup-state').toDynamicValue(ConfigurePhaserState);
});
