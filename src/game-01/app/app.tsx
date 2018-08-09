import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import { createMuiTheme, createStyles, MuiThemeProvider, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';

import GameView from 'game-01/components/game-view/game-view';
import { __ } from 'lib/localize';

const theme = createMuiTheme({
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

}

class App extends React.Component<IAppProps & WithStyles<typeof styles>, IAppState> {
	public render() {
		const { classes } = this.props;

		return (<MuiThemeProvider theme={ theme }>
				<CssBaseline/>
				<Paper className={ classes.root } elevation={ 1 }>
					<Typography variant="headline" component="h1">{ __('PHASER 3 Game Test') }</Typography>
					<GameView/>
				</Paper>
			</MuiThemeProvider>);
	}
}

export default hot(module)(withStyles(styles)<IAppProps>(App));
