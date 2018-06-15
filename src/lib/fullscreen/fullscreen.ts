/**
 * Request fullscreen on/off based on boolean value.
 */
export const setFullscreen = (fullscreen: boolean, element: any = document.getElementsByTagName('body')) => {
	if (fullscreen) {
		requestFullScreen(element);
	} else {
		exitFullScreen();
	}
};

/**
 * Request fullscreen depending on current fullscreen state.
 */
export const toggleFullscreen = (element: any = document.getElementsByTagName('body')) => {
	if (isFullScreen()) {
		requestFullScreen(element);
	} else {
		exitFullScreen();
	}
};

export const exitFullScreen = () => {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}

export const requestFullScreen = (element: any = document.getElementsByTagName('body')) => {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

export const isFullScreen = () => document.fullscreenElement ||
	document.webkitFullscreenElement ||
	document.mozFullScreenElement ||
	document.msFullscreenElement;
