import { createMuiTheme, createStyles, MuiThemeProvider, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { hot } from 'react-hot-loader';

// elements
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { __ } from 'lib/i18n';

import Loadable from 'react-loadable';

const Loader = () => <div>...</div>;

const GameView = Loadable({ loading: Loader, loader: () => import('game-01/components/game-view/game-view') });

const appTheme = createMuiTheme({
	typography: {
		htmlFontSize: 16,
	},
});

const styles = (theme: Theme) => createStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '20px 4px',
	},
	wrapper: {
		margin: theme.spacing.unit,
		position: 'relative',
	},
});

interface IAppProps {
}

interface IAppState {
	ready: boolean;
	phaserReady: boolean;
	loading: boolean;
}

class App extends React.Component<IAppProps & WithStyles<typeof styles>, IAppState> {
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			phaserReady: false,
			loading: false,
		};
	}

	public componentDidMount(): void {
		// optional preloading
		import('phaser').then(() => this.setState({ phaserReady: true }));
	}

	public render() {
		const { classes } = this.props;
		const { loading, ready, phaserReady } = this.state;

		const gameView = ready
			? <GameView/>
			: phaserReady
				? <Button color="primary" variant="contained" onClick={ this.start }>{ __('Start') }</Button>
				: <Typography component="p">{ `${__('loading')}: PHASER` }</Typography>;

		return (<MuiThemeProvider theme={ appTheme }>
				<CssBaseline/>
				<Paper className={ classes.root } elevation={ 1 }>
					{ loading ? <LinearProgress/> : null }
					<Typography variant="headline" component="h1">{ __('PHASER 3 Game Test') }</Typography>
					{ gameView }
				</Paper>
			</MuiThemeProvider>);
	}

	private start = () => {
		this.setState({ loading: true });
		// TODO: wrong type definition for preload
		(GameView.preload() as any).then(() => this.setState({ ready: true, loading: false }));
	}
}

export default hot(module)(withStyles(styles)<IAppProps>(App));
