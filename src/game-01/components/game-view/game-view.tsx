import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import ConfigIcon from '@material-ui/icons/Build';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import FullScreenExitIcon from '@material-ui/icons/FullscreenExit';
import PausedIcon from '@material-ui/icons/PauseCircleFilled';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import BackIcon from '@material-ui/icons/Undo';
import MuteOnIcon from '@material-ui/icons/VolumeOff';
import MuteOffIcon from '@material-ui/icons/VolumeUp';
import { Container } from 'inversify';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';

import ConfigurationViewComponent from 'game-01/components/configuration-view/configuration-view';
import FullScreenComponent from 'game-01/components/fullscreen/fullscreen';
import PhaserViewComponent from 'game-01/components/phaser-view/phaser-view';
import { createSetMuteAction, createSetPauseAction } from 'game-01/src/ui/actions/index';
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

import './game-view.scss';

const styles = (theme: Theme) => createStyles({
	root: {
		minWidth: '800px',
		minHeight: '600px',
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
	paused: boolean;
	mute: boolean;
	volume: number;
}

class GameViewComponent extends React.PureComponent<IGameViewProps & WithStyles<typeof styles>, IGameViewState> {
	private unsubscribe?: any;

	constructor(props) {
		super(props);
		this.state = {
			fullscreen: false,
			tab: 'game',
			paused: false,
			mute: false,
			volume: 1,
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

		return (<Paper className={ classes.root } elevation={ 1 }>
			<FullScreenComponent fullscreen={ fullscreen }>
				<AppBar position="fixed">
					<Toolbar>
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
					</Toolbar>
					<LinearProgress/>
				</AppBar>
				{ tab === 'configuration' ? <ConfigurationViewComponent/> : null }
				{ tab === 'game' ? <PhaserViewComponent keepInstanceOnRemove={ true }/> : null }
			</FullScreenComponent>
		</Paper>);
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
