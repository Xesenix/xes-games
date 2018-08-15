import fscreen from 'fscreen';

/**
 * Request fullscreen on/off based on boolean value.
 */
export const setFullscreen = (fullscreen: boolean, element: any = document.body) => {
	if (fullscreen) {
		requestFullScreen(element);
	} else {
		exitFullScreen();
	}
};

/**
 * Request fullscreen depending on current fullscreen state.
 */
export const toggleFullscreen = (element: any = document.body) => {
	if (isFullScreen()) {
		requestFullScreen(element);
	} else {
		exitFullScreen();
	}
};

export const exitFullScreen = () => {
	fscreen.exitFullscreen();
}

export const requestFullScreen = (element: any = document.getElementsByTagName('body')) => {
	fscreen.requestFullscreen(element);
}

export const isFullScreen = () => document.fullscreenElement ||
	document.webkitFullscreenElement ||
	document.mozFullScreenElement ||
	document.msFullscreenElement;

export const onFullScreenChange = (cb) => {
	document.addEventListener('fullscreenchange', cb);
	document.addEventListener('webkitfullscreenchange', cb);
	document.addEventListener('mozfullscreenchange', cb);
};
