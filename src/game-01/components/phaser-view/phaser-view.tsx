import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import { IPhaserGameProvider } from 'game-01/src/phaser/game.provider';
import { IUIState } from 'game-01/src/ui/reducers/index';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';

import './phaser-view.scss';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;

export interface IPhaserViewProps {
	di?: Container;
	store?: Store<IUIState>;
	keepInstanceOnRemove: boolean;
}

export interface IPhaserViewState {
	mute: boolean;
	paused: boolean;
}

class PhaserViewComponent extends React.PureComponent<IPhaserViewProps, IPhaserViewState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			mute: false,
			paused: false,
		};
	}

	public componentDidMount(): void {
		const { di } = this.props;

		if (!!di && gameContainer) {
			if (game && game.isBooted) {
				gameContainer.appendChild(game.canvas);
			} else {
				di.bind<HTMLElement | null>('phaser:container').toDynamicValue(() => gameContainer);
				di.get<IPhaserGameProvider>('phaser:game-provider')().then((result: Phaser.Game) => game = result);
			}
		}

		this.bindToStore();
	}

	public componentDidUpdate(): void {
		this.bindToStore();
	}

	public componentWillUnmount(): void {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	public render(): any {
		return <div className="phaser-view" ref={ this.bindContainer }></div>;
	}

	private bindToStore(): void {
		const { store } = this.props;

		if (!this.unsubscribe && store) {
			this.unsubscribe = store.subscribe(() => {
				if (store) {
					this.setState(store.getState());
				}
			});
			this.setState(store.getState());
		}
	}

	private bindContainer = (el: HTMLDivElement): void => { gameContainer = el; };
}

export default hot(module)(connectToInjector<IPhaserViewProps>(PhaserViewComponent, {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
