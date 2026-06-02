/**
 * Immutable value object representing an elapsed duration.
 * Time is stored in tenths of a second (ms100) to match the game's 100ms tick.
 * Pure: holds no DOM and no interval — ticking lives in the app, this just formats.
 */
export default class Timer {
	/** @param {number} ms100 - Elapsed time in tenths of a second */
	constructor (ms100 = 0) {
		this.ms100 = ms100;
	}

	/** Whole seconds within the current minute (0–59) */
	get seconds () {
		return (this.ms100 % 600) / 10 << 0;
	}

	/** Whole elapsed minutes */
	get minutes () {
		return this.ms100 / 600 << 0;
	}

	/** Format as mm:ss.d */
	toString () {
		let mm = String(this.minutes).padStart(2, "0");
		let ss = String(this.seconds).padStart(2, "0");
		let tenths = this.ms100 % 10;
		return `${mm}:${ss}.${tenths}`;
	}
}
