import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import MuteOffIcon from '@material-ui/icons/VolumeOff';
import MuteOnIcon from '@material-ui/icons/VolumeUp';
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
import { IUIState } from 'game-01/src/ui/reducers';
import { IUIStoreProvider } from 'game-01/src/ui/store.provider';
import { connectToInjector } from 'lib/di';
import { __ } from 'lib/localize';

const styles = (theme: Theme) => createStyles({
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
		const { classes } = this.props;

		return (<form>
			<Grid container spacing={0} alignItems="stretch">
				<Grid item xs={6} sm={4}>
					<FormControlLabel
						className={ classes.margin }
						label={ __('master mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon /> }
								icon={ <MuteOnIcon /> }
								checked={ this.getValue<boolean>('mute', false) }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={6} sm={4}>
					<FormControlLabel
						className={ classes.margin }
						label={ __('music mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon /> }
								icon={ <MuteOnIcon /> }
								checked={ this.getValue<boolean>('muteMusic', false) }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteMusicAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={6} sm={4}>
					<FormControlLabel
						className={ classes.margin }
						label={ __('fx mute') }
						control={
							<Checkbox
								checkedIcon={ <MuteOffIcon /> }
								icon={ <MuteOnIcon /> }
								checked={ this.getValue<boolean>('muteSound', false) }
								onChange={ (event, checked: boolean) => this.dispatch(createSetMuteSoundAction(checked)) }
							/>
						}
					/>
				</Grid>
				<Grid item xs={12} container>
					<Grid item xs={12} md={3}>
						<FormControlLabel
							className={ classes.margin }
							label={ __('master volume') }
							control={
								<span className={ classes.icon }><MuteOnIcon/></span>
							}
						/>
					</Grid>
					<Grid item xs={12} md={9} className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ this.getValue<number>('volume', 1) }
							onChange={ (event, value) => this.dispatch(createSetVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
				<Grid item xs={12} container>
					<Grid item xs={12} md={3}>
						<FormControlLabel
							className={ classes.margin }
							label={ __('music volume') }
							control={
								<span className={ classes.icon }><MuteOnIcon/></span>
							}
						/>
					</Grid>
					<Grid item xs={12} md={9} className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ this.getValue<number>('musicVolume', 1) }
							onChange={ (event, value) => this.dispatch(createSetMusicVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
				<Grid item xs={12} container>
					<Grid item xs={12} md={3}>
						<FormControlLabel
							className={ classes.margin }
							label={ __('sound volume') }
							control={
								<span className={ classes.icon }><MuteOnIcon /></span>
							}
						/>
					</Grid>
					<Grid item xs={12} md={9} className={ classes.scroll }>
						<Slider
							min={ 0 }
							max={ 1 }
							step={ 1 / 32 }
							value={ this.getValue<number>('soundVolume', 1) }
							onChange={ (event, value) => this.dispatch(createSetSoundVolumeAction(value)) }
						/>
					</Grid>
				</Grid>
			</Grid>
		</form>);
	}

	private getValue<T>(key: string, defaultValue: T): T {
		return this.props.store ? this.props.store.getState()[key] : defaultValue;
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
