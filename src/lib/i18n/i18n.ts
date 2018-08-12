import Gettext from 'node-gettext';

/**
 * We instantiate singleton translation object so any changes to it will affect all places that need translation.
 */
export const i18n = new Gettext();

/**
 * Shorter version for translations also needed for easy translations extraction.
 * This needs to be bind to translation object to take into account any changes in current locale set in it.
 */
export const __ = i18n.gettext.bind(i18n);
