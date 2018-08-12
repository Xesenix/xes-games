import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Action, Store } from 'redux';

// elements
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/lab/Slider';

// icons
import SoundOffIcon from '@material-ui/icons/FlashOff';
import SoundOnIcon from '@material-ui/icons/FlashOn';
import MusicOnIcon from '@material-ui/icons/MusicNote';
import MusicOffIcon from '@material-ui/icons/MusicOff';
import MuteOffIcon from '@material-ui/icons/VolumeOff';
import MuteOnIcon from '@material-ui/icons/VolumeUp';

import {
	createSetMusicVolumeAction,
	createSetMuteAction,
	createSetMuteMusicAction,
	createSetMuteSoundAction,
	createSetSoundVolumeAction,
	createSetVolumeAction,
} from 'game-01/src/ui';
import { defaultUIState, IUIState } from 'game-01/src/ui/reducers';
import { IStoreProvider } from 'lib/data-store';
import { connectToInjector } from 'lib/di';
import {
	__,
	createSetLanguageAction,
	II18nState,
	LanguageType,
} from 'lib/i18n';
import { IValueAction } from 'lib/interfaces';

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
	formControl: {
		margin: theme.spacing.unit,
		minWidth: 120,
	},
});

export interface IConfigurationProps {
	store?: Store<IUIState & II18nState>;
}
export interface IConfigurationState { }

export class ConfigurationViewComponent extends React.Component<IConfigurationProps & WithStyles<typeof styles>, IConfigurationState> {
	public render(): any {
		const { classes, store = { getState: () => ({ ...defaultUIState, language: 'en' }) } } = this.props;
		const {
			mute,
			muteMusic,
			muteSound,
			volume,
			musicVolume,
			soundVolume,
			language,
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
				<Grid item xs={ 12 } container>
					<Grid item xs={ 12 } md={ 3 }>
						<FormControl className={ classes.formControl }>
							<InputLabel>{ __('language') }</InputLabel>
							<Select
								value={ language }
								onChange={ (event) => this.dispatch(createSetLanguageAction(event.target.value as LanguageType)) }
							>
								<option value={ 'en' }>{ __('english') }</option>
								<option value={ 'pl' }>{ __('polish') }</option>
							</Select>
						</FormControl>
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
	'data-store-provider': {
		name: 'store',
		value: (provider: IStoreProvider<IUIState & II18nState, IValueAction>) => provider(),
	},
}));
