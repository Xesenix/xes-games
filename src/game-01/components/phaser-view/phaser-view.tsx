import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import { IPhaserGameProvider } from 'game-01/src/phaser/game.provider';
import { IUIState } from 'game-01/src/ui';
import { IDataStoreProvider } from 'lib/data-store';
import { connectToInjector } from 'lib/di';
import { IValueAction } from 'lib/interfaces';

let game: Phaser.Game | null;
let gameContainer: HTMLDivElement | null;

const styles = (theme: Theme) => createStyles({
	root: {
		'minHeight': '600px',
		'padding': '0',
		'display': 'flex',
		'justifyContent': 'center',
		'backgroundColor': theme.palette.type === 'dark' ? theme.palette.grey['900'] : theme.palette.grey['500'],
	},
});

export interface IPhaserViewProps {
	di?: Container;
	store?: Store<IUIState>;
	keepInstanceOnRemove: boolean;
}

export interface IPhaserViewState {
	mute: boolean;
	paused: boolean;
}

class PhaserViewComponent extends React.PureComponent<IPhaserViewProps & WithStyles<typeof styles>, IPhaserViewState> {
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
		const { classes } = this.props;

		return <div className={ classes.root } ref={ this.bindContainer }></div>;
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

export default hot(module)(connectToInjector<IPhaserViewProps>(withStyles(styles)(PhaserViewComponent), {
	'data-store:provider': {
		name: 'store',
		value: (provider: IDataStoreProvider<IUIState, IValueAction>) => provider(),
	},
}));
