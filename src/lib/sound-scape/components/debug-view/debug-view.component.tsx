import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { hot } from 'react-hot-loader';

import { IDataStoreProvider } from 'lib/data-store';
import { connectToInjector } from 'lib/di';
import { IValueAction } from 'lib/interfaces';

import { ISoundScapeState } from '../../interfaces';

const styles = (theme: Theme) => createStyles({
	root: {
		display: 'block',
		padding: '24px',
	},
});

export interface ISoundScapeDebugViewProps {

}

export interface ISoundScapeDebugViewState {
	viewContainer?: HTMLDivElement;
	timeline?: any;
}

class SoundScapeDebugViewComponent extends React.PureComponent<ISoundScapeDebugViewProps & WithStyles<typeof styles>, ISoundScapeDebugViewState> {
	constructor(props: ISoundScapeDebugViewProps & WithStyles<typeof styles>) {
		super(props);

		this.state = {};
	}

	public componentDidUpdate(): void {
		const { viewContainer, timeline } = this.state;
		console.log('SoundScapeDebugViewComponent:componentDidUpdate', viewContainer, timeline);

		if (viewContainer && !timeline) {
			console.log('SoundScapeDebugViewComponent:componentDidUpdate');
			Promise.all([
				import('vis/lib/network/Network'),
				import('vis/lib/timeline/Timeline'),
				import('vis/lib/DataSet'),
				import('vis/dist/vis.min.css'),
			]).then(([{ default: Network }, { default: Timeline }, { default: DataSet }]) => {
				console.log('SoundScapeDebugViewComponent:componentDidUpdate:then', Timeline, Network, DataSet);
				const nodes = new DataSet([
					{id: 1, content: 'item 1', start: 12, end: 16 },
				]);
				this.setState({ timeline: new Timeline(viewContainer, nodes, [], {}) });
			}, (err) => {
				console.log('SoundScapeDebugViewComponent:componentDidUpdate:error', err);
			});
		}
	}

	public render(): any {
		const { classes } = this.props;

		return <div className={ classes.root } ref={ this.bindContainer }>DEBUG SOUND SCAPE</div>;
	}

	private bindContainer = (viewContainer: HTMLDivElement): void => { this.setState({ viewContainer }); };
}

export default hot(module)(connectToInjector<ISoundScapeDebugViewProps>(withStyles(styles)(SoundScapeDebugViewComponent), {
	'data-store:provider': {
		name: 'store',
		value: (provider: IDataStoreProvider<ISoundScapeState, IValueAction>) => provider(),
	},
}));
