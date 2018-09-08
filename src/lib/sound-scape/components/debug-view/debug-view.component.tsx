import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { EventEmitter } from 'events';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { interval, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { isNumber } from 'util';

import { connectToInjector } from 'lib/di';

import { IScheduledSoundtrack, ISoundtrackPlayer } from '../../interfaces';
import { Container } from 'inversify';

const styles = (theme: Theme) => createStyles({
	root: {
		display: 'block',
		padding: '24px',
		marginBottom: '0',
	},
	timeline: {
		// fix viz element overlapping outside elements
		'position': 'relative',
		'z-index': 0,
		// sync theme
		'& *': {
			fontFamily: theme.typography.fontFamily,
			borderColor: theme.palette.grey['100'],
		},
		'& .vis-labelset .vis-label, & .vis-time-axis .vis-text': {
			fontFamily: theme.typography.fontFamily,
			color: theme.palette.text.primary,
		},
		'& .vis-grid.vis-vertical.vis-minor': {
			borderColor: theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'],
			backgroundColor: theme.palette.grey[theme.palette.type === 'dark' ? '900' : '100'],
		},
		'& .vis-item': {
			'backgroundColor': theme.palette.primary.light,
			'color': theme.palette.primary.contrastText,
			'borderColor': theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'],
			'&.vis-old': {
				backgroundColor: theme.palette.secondary.light,
				color: theme.palette.secondary.contrastText,
			},
			'&.vis-selected': {
				backgroundColor: theme.palette.primary.dark,
				color: theme.palette.primary.contrastText,
				borderColor: theme.palette.grey[theme.palette.type === 'dark' ? '300' : '800'],
			},
			'& .vis-small': {
				fontSize: '0.75em',
			},
		},
		'& .vis-custom-time.now': {
			'backgroundColor': theme.palette.secondary.light,
			'z-index': 2,
			'width': '8px',
			'opacity': 0.5,
		},
	},
});

export interface ISoundScapeDebugViewProps {
	audioContext?: AudioContext;
	soundtrackPlayer?: ISoundtrackPlayer;
	eventsManager?: EventEmitter;
	di?: Container;
}

export interface ISoundScapeDebugViewState {
	viewContainer?: HTMLDivElement;
	timeline?: any;
	currentAudioTime: number;
}

class SoundScapeDebugViewComponent extends React.PureComponent<ISoundScapeDebugViewProps & WithStyles<typeof styles>, ISoundScapeDebugViewState> {
	private subscription: Subscription = new Subscription();

	constructor(props: ISoundScapeDebugViewProps & WithStyles<typeof styles>) {
		super(props);

		this.state = {
			currentAudioTime: 0,
		};
	}

	public componentDidMount(): void {
		const { eventsManager, audioContext } = this.props;
		console.log('SoundScapeDebugViewComponent:componentDidMount', eventsManager);

		if (eventsManager) {
			this.subscription.add(Observable.create((observer) => {
				eventsManager.on('soundtrack:schedule-changed', observer.next.bind(observer));
			}).pipe(
				debounceTime(100),
			).subscribe(this.updateTimeline));
		}

		if (audioContext) {
			this.subscription.add(interval(250).pipe(
					map(() => Math.floor(audioContext.currentTime * 4) * 0.25),
					distinctUntilChanged(),
					map((currentAudioTime) => ({
						currentAudioTime,
					})),
				).subscribe(this.setState.bind(this)));
		}
	}

	public componentDidUpdate(): void {
		const { viewContainer, timeline: tl } = this.state;
		// console.log('SoundScapeDebugViewComponent:componentDidUpdate', viewContainer, tl);

		if (viewContainer && !tl) {
			console.log('SoundScapeDebugViewComponent:componentDidUpdate', viewContainer, tl);
			Promise.all([
				// import('vis/lib/network/Network'),
				import('vis/lib/timeline/Timeline'),
				import('vis/lib/DataSet'),
				import('moment'),
				import('vis/dist/vis.min.css'),
			]).then(([
				// { default: Network },
				{ default: Timeline },
				{ default: DataSet },
				{ default: moment },
			]) => {
				const { timeline: timelineIsInitialized } = this.state;
				console.log('SoundScapeDebugViewComponent:componentDidUpdate:then', Timeline, DataSet);
				if (!timelineIsInitialized) {
					const nodes = new DataSet([
						{ id: 1, group: 0, content: 'Hello', start: 0, end: 100 },
					]);
					const groups = [
						{ id: 'loop', content: 'loop' },
						{ id: 'intro', content: 'intro' },
						{ id: 'outro', content: 'outro' },
						{ id: 'endless', content: 'endless' },
					];
					const options = {
						minHeight: '240px',
						maxHeight: '480px',
						min: 0,
						showMajorLabels: false,
						stack: true,
						// showCustomTime: true,
						moment,
					};
					const timeline = new Timeline(viewContainer, nodes, groups, options);
					timeline.currentTime.stop();
					timeline.addCustomTime(0, 'now');
					timeline.on('rangechange', () => {
						const { currentAudioTime } = this.state;
						timeline.setCustomTime(currentAudioTime, 'now');
					});
					this.setState({ timeline });
					// this.updateTimeline();
					if (this.props.di) {
						if (this.props.di.isBound('sound-scape:debug-view:items')) {
							timeline.setItems(this.props.di.get('sound-scape:debug-view:items'));
						} else {
							this.props.di.bind('sound-scape:debug-view:items').toConstantValue([]);
						}
					}
				}
			}, (err) => {
				console.log('SoundScapeDebugViewComponent:componentDidUpdate:error', err);
			});
		}
	}

	public componentWillUnmount(): void {
		this.subscription.unsubscribe();
	}

	public render(): any {
		const { classes } = this.props;
		const { currentAudioTime, timeline } = this.state;

		// update current audio time
		if (timeline) {
			timeline.setCustomTime(currentAudioTime, 'now');
		}

		return <Paper className={ classes.root } elevation={ 2 }>
				<Typography component="h3">DEBUG SOUND SCAPE</Typography>
				<Typography component="p">Audio context time: { currentAudioTime }</Typography>
				<div className={ classes.timeline } ref={ this.bindTimelineContainer }></div>
			</Paper>;
	}

	private updateTimeline = (): void => {
		const { soundtrackPlayer, audioContext: { currentTime = 0 } } = this.props;
		const { timeline, currentAudioTime } = this.state;
		console.log('SoundScapeDebugViewComponent:componentDidMount:soundtrack:schedule-changed', { currentTime, soundtrackPlayer, timeline });
		if (soundtrackPlayer && timeline) {
			const schedule = soundtrackPlayer.getSchedule();
			const newItems = schedule.map((block: IScheduledSoundtrack, id: number) => {
				const { soundtrack: { name }, state, start, end = 'inf' } = block;
				return {
					id: `${start.toFixed(4)}-${end && isNumber(end) ? end.toFixed(4) : end}-${name}-${state}`,
					group: state,
					content: `${name}<div class="vis-small">[${start.toFixed(2)}s-${end && isNumber(end) ? end.toFixed(2) + 's' : end}]</div>`,
					start,
					end,
					data: {
						start,
						end,
						name,
						state,
					},
				};
			});
			const items = timeline.itemsData.get()
				.filter((item) => item.data && newItems.every((data) => data.id !== item.id) && item.data.end && item.data.end < currentAudioTime + 0.5 )
				.map((item) => {
					const end = Math.min(item.data.end, currentAudioTime);
					return {
						...item,
						className: 'vis-old',
						end,
						id: `${item.data.start.toFixed(4)}-${end.toFixed(4)}-${item.data.name}-${item.data.state}`,
						data: {
							...item.data,
							end,
						},
					};
				})
				.concat(newItems);
			console.log('SoundScapeDebugViewComponent:componentDidMount:soundtrack:schedule-changed', currentAudioTime, newItems, items);
			timeline.setCustomTime(currentAudioTime, 'now');
			timeline.setItems(items);
			this.setState({});

			if (this.props.di) {
				this.props.di.rebind('sound-scape:debug-view:items').toConstantValue(items);
			}
		}
	}

	private bindTimelineContainer = (viewContainer: HTMLDivElement): void => { this.setState({ viewContainer }); };
}

export default hot(module)(connectToInjector<ISoundScapeDebugViewProps>(withStyles(styles)(SoundScapeDebugViewComponent), {
	'sound-scape:soundtrack-player': {
		name: 'soundtrackPlayer',
		value: (soundtrackPlayer: ISoundtrackPlayer) => Promise.resolve(soundtrackPlayer),
	},
	'event-manager': {
		name: 'eventsManager',
		value: (eventsManager: EventEmitter) => Promise.resolve(eventsManager),
	},
	'audio-context': {
		name: 'audioContext',
		value: (audioContext: AudioContext) => Promise.resolve(audioContext),
	},
}));
