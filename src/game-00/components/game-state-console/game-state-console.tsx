import * as React from 'react';
import { hot } from 'react-hot-loader';

import { CommandType, IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import { IGameObjectState } from 'lib/game/board/interface';
import { __ } from 'lib/i18n';

import './game-state-console.scss';

export interface IGameStateConsoleComponentProps {
	state: IAncientMazeState<IGameObjectState>;
}

export interface IGameStateConsoleComponentState {
}

const KEY_ITEM_TYPE = Symbol.for('KEY_ITEM_TYPE');

class GameStateConsoleComponent extends React.Component<IGameStateConsoleComponentProps, IGameStateConsoleComponentState> {
	public render(): any {
		const { state } = this.props;

		return (
			<div className="console">
				{ __('Finished') }: { state.finished ? 'yes' : 'no' }<br/>
				{ __('Command') }: { state.command }<br/>
				{ __('Keys') }: { state.collected[KEY_ITEM_TYPE] } / { state.initialCollectableCount[KEY_ITEM_TYPE] }<br/>
				{ __('Steps') }: { state.steps }<br/>
				{ __('Command buffer') }: {
					state.inputBuffer.map(
						(cmd: CommandType, index: number) => <span key={index}><span className="pill">'{ cmd }'</span>, </span>,
					)
				}<br/>
				{ __('Executed moves') }: {
					state.executedCommands.map(
						(cmd: CommandType, index: number) => <span key={index}><span className="pill">'{ cmd }'</span>, </span>,
					)
				}
			</div>
		);
	}
}

export default hot(module)(GameStateConsoleComponent);
