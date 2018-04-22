import { ContainerModule, interfaces } from 'inversify';
import { ConfigurePhaserState, IPhaserSetupProvider } from './phaser-configure-state';
import { IPhaserProvider, PhaserProvider } from './phaser-provider';

export const PhaserModule = () => new ContainerModule((bind: interfaces.Bind) => {
	bind<IPhaserProvider>('phaser:phaser-provider').toProvider(PhaserProvider);
	bind<IPhaserSetupProvider>('phaser:setup-state').toDynamicValue(ConfigurePhaserState);
});
