import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { defaultUIState, IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

import Loadable from 'react-loadable';

const Loader = () => <div>...</div>;

const Button = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Button') });
const Drawer = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Drawer') });
const Paper = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Paper') });
const Toolbar = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Toolbar') });

const ConfigIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/Build') });
const FullScreenIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/Fullscreen') });
const FullScreenExitIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/FullscreenExit') });
const MenuIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/Menu') });
const PausedIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/PauseCircleFilled') });
const PlayIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/PlayCircleFilled') });
const BackIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/Undo') });
const MuteOnIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/VolumeOff') });
const MuteOffIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/VolumeUp') });

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
	fullscreen: boolean;
	tab: 'configuration' | 'game';
	drawer: boolean;
}

class GameViewComponent extends React.PureComponent<IGameViewProps & WithStyles<typeof styles>, IGameViewState & IUIState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			fullscreen: false,
			tab: 'game',
			drawer: false,
			...defaultUIState,
		};
	}

	public componentDidMount(): void {
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
		const { tab = 'game', fullscreen, paused, mute } = this.state;
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
						<FullScreenComponent fullscreen={ fullscreen }>
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
								<LinearProgress/>
							</AppBar>
							<Drawer
								anchor="left"
								open={ this.state.drawer }
								onClose={ this.toggleDrawer }
							>{ menu }</Drawer>
							{ tab === 'configuration' ? <ConfigurationViewComponent/> : null }
							{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={ true }/> : null }
						</FullScreenComponent>
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
		this.setState({
			fullscreen: !this.state.fullscreen,
		});
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
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
