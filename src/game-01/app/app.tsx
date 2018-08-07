import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';

import { __ } from 'lib/localize';
import GameView from 'game-01/components/game-view/game-view';

class App extends React.Component {
	public render() {
		return (<div>
			<h3>{ __('PHASER 3 Game Test') }</h3>
			<GameView/>
		</div>);
	}
}

export default hot(module)(App);
