import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

// elements
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
// icons
import ConfigIcon from '@material-ui/icons/Build';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import FullScreenExitIcon from '@material-ui/icons/FullscreenExit';
import MenuIcon from '@material-ui/icons/Menu';
import PausedIcon from '@material-ui/icons/PauseCircleFilled';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import BackIcon from '@material-ui/icons/Undo';
import MuteOnIcon from '@material-ui/icons/VolumeOff';
import MuteOffIcon from '@material-ui/icons/VolumeUp';

import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import {
	createSetFullscreenAction,
	createSetMuteAction,
	createSetPauseAction,
	defaultUIState,
	IUIState,
} from 'game-01/src/ui';
import { IDataStoreProvider } from 'lib/data-store';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/i18n';
import { IValueAction } from 'lib/interfaces';

import Loadable from 'react-loadable';

const Loader = () => <LinearProgress/>;

const ConfigurationViewComponent = Loadable({ loading: Loader, loader: () => import('game-01/components/configuration-view/configuration-view') });
const PhaserViewComponent = Loadable({ loading: Loader, loader: () => import('game-01/components/phaser-view/phaser-view') });

import './game-view.scss';

const styles = (theme: Theme) => createStyles({
	root: {
		minHeight: '600px',
		padding: '0',
	},
	button: {
		margin: theme.spacing.unit,
	},
	extendedIcon: {
		marginRight: theme.spacing.unit,
	},
});

export interface IGameViewProps {
	di?: Container;
	store?: Store<IUIState>;
}

export interface IGameViewState {
	tab: 'configuration' | 'game';
	drawer: boolean;
	loading: boolean;
}

class GameViewComponent extends React.PureComponent<IGameViewProps & WithStyles<typeof styles>, IGameViewState & IUIState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			tab: 'game',
			drawer: false,
			loading: false,
			...defaultUIState,
		};
	}

	public componentDidMount(): void {
		this.bindToStore();

		// optional preloading
		this.setState({ loading: true });
		import('phaser').then(() => this.setState({ loading: false }));
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
		const { tab = 'game', fullscreen, paused, mute, loading } = this.state;
		const { classes } = this.props;

		const menu = (<>
			{ tab === 'configuration'
				? <Button variant="extendedFab" className={ classes.button } onClick={ this.backHandle }>
					<BackIcon className={ classes.extendedIcon }/>
					{ __('Back') }
				</Button>
				: null
			}
			{ tab === 'game'
				? <Button variant="extendedFab" className={ classes.button } onClick={ this.openConfigurationHandle }>
					<ConfigIcon className={ classes.extendedIcon }/>
					{ __('Configuration') }
				</Button>
				: null
			}
			<Button color="secondary" variant="extendedFab" className={ classes.button } onClick={ this.toggleFullScreen }>
				{ fullscreen ? <FullScreenExitIcon className={ classes.extendedIcon }/> : <FullScreenIcon className={ classes.extendedIcon } /> }
				{ __('Fullscreen') }
			</Button>
			<Button color="primary" variant="extendedFab" className={ classes.button } onClick={ this.togglePause }>
				{ paused ? <PausedIcon className={ classes.extendedIcon }/> : <PlayIcon className={ classes.extendedIcon }/> }
				{ __('Pause') }
			</Button>
			<Button color="primary" variant="extendedFab" className={ classes.button } onClick={ this.toggleMute }>
				{ mute ? <MuteOnIcon className={ classes.extendedIcon }/> : <MuteOffIcon className={ classes.extendedIcon }/> }
				{ __('Mute') }
			</Button>
		</>);

		return (
			<Grid container spacing={ 0 } alignItems="center">
				<Grid item xs={ 12 }>
					<Paper className={ classes.root } elevation={ 2 }>
						<AppBar position="fixed">
							<Toolbar>
								<Hidden xsDown>
									{ menu }
								</Hidden>
								<Hidden smUp>
									<Button color="primary" variant="fab" className={ classes.button } onClick={ this.toggleDrawer }>
										<MenuIcon />
									</Button>
								</Hidden>
							</Toolbar>
							{ loading ? <LinearProgress/> : null }
						</AppBar>
						<Drawer
							anchor="left"
							open={ this.state.drawer }
							onClose={ this.toggleDrawer }
						>{ menu }</Drawer>
						{ tab === 'configuration' ? <ConfigurationViewComponent/> : null }
						{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={ true }/> : null }
					</Paper>
				</Grid>
			</Grid>);
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

	private openConfigurationHandle = (): void => {
		this.setState({
			tab: 'configuration',
		});
	}

	private backHandle = (): void => {
		this.setState({
			tab: 'game',
		});
	}

	private toggleDrawer = (): void => {
		this.setState({
			drawer: !this.state.drawer,
		});
	}

	private toggleFullScreen = (): void => {
		const { store } = this.props;
		const { fullscreen } = this.state;
		if (store) {
			store.dispatch(createSetFullscreenAction(!fullscreen));
		}
	}

	private togglePause = (): void => {
		const { store } = this.props;
		const { paused } = this.state;
		if (store) {
			store.dispatch(createSetPauseAction(!paused));
		}
	}

	private toggleMute = (): void => {
		const { store } = this.props;
		const { mute } = this.state;
		if (store) {
			store.dispatch(createSetMuteAction(!mute));
		}
	}
}

export default hot(module)(connectToInjector<IGameViewProps>(withStyles(styles)(GameViewComponent), {
	'data-store:provider': {
		name: 'store',
		value: (provider: IDataStoreProvider<IUIState, IValueAction>) => provider(),
	},
}));
