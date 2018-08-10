import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Slider from '@material-ui/lab/Slider';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Action, Store } from 'redux';

import {
	createSetMusicVolumeAction,
	createSetMuteAction,
	createSetMuteMusicAction,
	createSetMuteSoundAction,
	createSetSoundVolumeAction,
	createSetVolumeAction,
} from 'game-01/src/ui/actions';
import { defaultUIState, IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

import Loadable from 'react-loadable';

const Loader = () => <div>...</div>;

const Checkbox = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Checkbox') });
const FormControlLabel = Loadable({ loading: Loader, loader: () => import('@material-ui/core/FormControlLabel') });
const Grid = Loadable({ loading: Loader, loader: () => import('@material-ui/core/Grid') });

const SoundOffIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/FlashOff') });
const SoundOnIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/FlashOn') });
const MusicOnIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/MusicNote') });
const MusicOffIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/MusicOff') });
const MuteOffIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/VolumeOff') });
const MuteOnIcon = Loadable({ loading: Loader, loader: () => import('@material-ui/icons/VolumeUp') });

const styles = (theme: Theme) => createStyles({
	root: {
		display: 'block',
		padding: '24px',
	},
	textField: {
		color: 'red',
		margin: theme.spacing.unit,
	},
	margin: {
		margin: theme.spacing.unit,
	},
	icon: {
		'display': 'inline-flex',
		'width': '48px',
		'height': '48px',
		'justify-content': 'center',
		'align-items': 'center',
	},
	scroll: {
		'display': 'inline-flex',
		'align-items': 'center',
	},
});

export interface IConfigurationProps {
	store?: Store<IUIState>;
}
export interface IConfigurationState { }

class ConfigurationViewComponent extends React.Component<IConfigurationProps & WithStyles<typeof styles>, IConfigurationState> {
	public render(): any {
		const { classes, store = { getState: () => defaultUIState } } = this.props;
		const {
			mute,
			muteMusic,
			muteSound,
			volume,
			musicVolume,
			soundVolume,
		} = store.getState();

		return (<form className={ classes.root }>
			<Grid container spacing={ 0 } alignItems="stretch">
				<Grid item xs={ 6 } sm={ 4 }>
					<FormControlLabel
						className={ classes.margin }
						label={ __('master mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon/> }
								icon={ <MuteOnIcon/> }
								checked={ mute }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={ 6 } sm={ 4 }>
					<FormControlLabel
						className={ classes.margin }
						label={ __('music mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon/> }
								icon={ <MuteOnIcon/> }
								checked={ muteMusic }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteMusicAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={ 6 } sm={ 4 }>
					<FormControlLabel
						className={ classes.margin }
						label={ __('fx mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon/> }
								icon={ <MuteOnIcon/> }
								checked={ muteSound }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteSoundAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={ 12 } container>
					<Grid item xs={ 12 } md={ 3 }>
						<FormControlLabel
							className={ classes.margin }
							label={ __('master volume') }
							control={
								<span className={ classes.icon }>{ mute ? <MuteOffIcon/> : <MuteOnIcon/> }</span>
							}
						/>
					</Grid>
					<Grid item xs={ 12 } md={ 9 } className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ volume }
							onChange={ (event, value) => this.dispatch(createSetVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
				<Grid item xs={ 12 } container>
					<Grid item xs={ 12 } md={ 3 }>
						<FormControlLabel
							className={ classes.margin }
							label={ __('music volume') }
							control={
								<span className={ classes.icon }>{ mute || muteMusic ? <MusicOffIcon/> : <MusicOnIcon/> }</span>
							}
						/>
					</Grid>
					<Grid item xs={ 12 } md={ 9 } className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ musicVolume }
							onChange={ (event, value) => this.dispatch(createSetMusicVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
				<Grid item xs={ 12 } container>
					<Grid item xs={ 12 } md={ 3 }>
						<FormControlLabel
							className={ classes.margin }
							label={ __('sound volume') }
							control={
								<span className={ classes.icon }>{ mute || muteSound ? <SoundOffIcon/> : <SoundOnIcon/> }</span>
							}
						/>
					</Grid>
					<Grid item xs={ 12 } md={ 9 } className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ soundVolume }
							onChange={ (event, value) => this.dispatch(createSetSoundVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
			</Grid>
		</form>);
	}

	private dispatch(action: Action): void {
		const { store } = this.props;

		if (store) {
			store.dispatch(action);
		}
	}
}

export default hot(module)(connectToInjector<IConfigurationProps>(withStyles(styles)(ConfigurationViewComponent), {
	'ui:store': {
		name: 'store',
		value: (provider: IUIStoreProvider) => provider(),
	},
}));
