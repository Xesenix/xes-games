import * as React from 'react';
import { hot } from 'react-hot-loader';

import { CommandType, IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import { IGameObjectState } from 'lib/game/board/interface';
import { __ } from 'lib/localize';

import './game-state-console.scss';

export interface IGameStateConsoleComponentProps {
	state: IAncientMazeState;
}

export interface IGameStateConsoleComponentState {
}

class GameStateConsoleComponent extends React.Component<IGameStateConsoleComponentProps, IGameStateConsoleComponentState> {
	public render(): any {
		const { state } = this.props;

		return (
			<div className="console">
				{ __('Command') }: { state.command }<br/>
				{ __('Keys') }: { state.collected[0] } / { state.initialCollectableCount[0] }<br/>
				{ __('Steps') }: { state.steps }<br/>
				{ __('Executed moves') }: { state.executedCommands.map((cmd: CommandType, index: number) => <span key={index} className="pill">'{ cmd }'</span>) }
			</div>
		);
	}
}

export default hot(module)(GameStateConsoleComponent);
