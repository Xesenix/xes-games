import { createMuiTheme, createStyles, MuiThemeProvider, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

// elements
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import { defaultUIState, IUIState } from 'game-01/src/ui';
import { IDataStoreProvider } from 'lib/data-store';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/i18n';
import { IValueAction } from 'lib/interfaces';

import Loadable from 'react-loadable';

const Loader = () => <div>...</div>;

const GameView = Loadable({ loading: Loader, loader: () => import('game-01/components/game-view/game-view') });

const appThemes = {
	light: createMuiTheme({
		typography: {
			htmlFontSize: 16,
		},
		palette: {
			type: 'light',
			secondary: {
				light: '#ffc000',
				main: '#e8a000',
				dark: '#d09000',
				contrastText: '#ffffff',
			},
			primary: {
				light: '#ff8000',
				main: '#c30000',
				dark: '#a00000',
				contrastText: '#ffffff',
			},
		},
	}),
	dark: createMuiTheme({
		typography: {
			htmlFontSize: 16,
		},
		palette: {
			type: 'dark',
			secondary: {
				light: '#ff00d0',
				main: '#d000a0',
				dark: '#a00080',
				contrastText: '#ffffff',
			},
			primary: {
				light: '#a040c3',
				main: '#8030a0',
				dark: '#602080',
				contrastText: '#ffffff',
			},
		},
	}),
};

const styles = (theme: Theme) => createStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '24px 4px 36px',
	},
	wrapper: {
		margin: theme.spacing.unit,
		position: 'relative',
	},
	headline: {
		marginBottom: '8px',
	}
});

interface IAppProps {
	di?: Container;
	store?: Store<IUIState, IValueAction>;
}

interface IAppState {
	ready: boolean;
	phaserReady: boolean;
	loading: boolean;
}

class App extends React.Component<IAppProps & WithStyles<typeof styles>, IAppState & IUIState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			...defaultUIState,
			ready: false,
			phaserReady: false,
			loading: false,
		};
	}

	public componentDidMount(): void {
		// optional preloading
		import('phaser').then(() => this.setState({ phaserReady: true }));
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

	public render() {
		const { classes } = this.props;
		const { loading, ready, phaserReady, theme = 'light' } = this.state;

		const gameView = ready
			? <GameView/>
			: phaserReady
				? <Button color="primary" variant="contained" onClick={ this.start }>{ __('Start') }</Button>
				: <Typography component="p">{ `${__('loading')}: PHASER` }</Typography>;

		return (<MuiThemeProvider theme={ appThemes[theme] }>
				<CssBaseline/>
				<Paper className={ classes.root } elevation={ 1 }>
					{ loading ? <LinearProgress/> : null }
					<Typography className={ classes.headline } variant="headline" component="h1">{ __('PHASER 3 Game Test') }</Typography>
					{ gameView }
				</Paper>
			</MuiThemeProvider>);
	}

	private start = () => {
		this.setState({ loading: true });
		// TODO: wrong type definition for preload
		(GameView.preload() as any).then(() => this.setState({ ready: true, loading: false }));
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
}

export default hot(module)(connectToInjector<IAppProps>(withStyles(styles)(App), {
	'data-store:provider': {
		name: 'store',
		value: (provider: IDataStoreProvider<IUIState, IValueAction>) => provider(),
	},
}));
