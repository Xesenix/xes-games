import * as React from 'react';
import { hot } from 'react-hot-loader';

import { IAppDataState, IPreloadState } from 'app/reducer';
import { DataStore } from 'lib/data-store/data-store';

export interface IGameViewProps {
	dataStore: DataStore<IAppDataState>;
}

export interface IGameViewState {
	preload: IPreloadState;
}

class GameView extends React.Component<IGameViewProps, IGameViewState> {
	constructor(props: IGameViewProps, context: any) {
		super(props, context);
		console.log('context', context);
		this.state = {
			preload: { progress: 0, description: '', complete: false },
		};
	}

	public componentDidMount() {
		const { dataStore = null } = this.props;

		if (dataStore !== null) {
		}
	}

	public componentWillUnmount() {
	}

	public render(): any {
		const { preload } = this.state;

		return (<div className="panel panel-primary">
			<div className="panel-heading">Game</div>
			<div className="panel-body">
				#BODY
			</div>
			<div className="panel-footer">
				#FOOTER
			</div>
		</div>);
	}
}

export default hot(module)(GameView);
