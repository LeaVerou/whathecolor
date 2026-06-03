import Color from "colorjs.io";

/**
 * A single color-guessing round: a target color and the sequence of guesses made against it.
 * Every guess — a keystroke in code mode, a slider step in visual mode — is recorded, so the
 * progression strip and counters reflect the whole path through color space. The most recent
 * guess drives the proximity readout, the "your color" swatch, and win detection.
 *
 * Derived, throwaway value object (recreated whenever its inputs change), so all state is held
 * as plain CSS strings — Color objects are reconstructed lazily in the getters. This keeps it
 * safe to expose through a Vue computed without reactivity wrapping live Color instances.
 *
 * @typedef {string} CssColor - Any CSS color string parseable by Color.js
 */
export default class Round {
	/**
	 * @param {CssColor} solution - The color to guess
	 * @param {CssColor[]} attempts - Guesses in the order they were made
	 */
	constructor (solution, attempts = []) {
		this.solution = solution;
		this.attempts = attempts;
	}

	/** The target color */
	get target () {
		return new Color(this.solution);
	}

	/** All guesses as Color objects */
	get colors () {
		return this.attempts.map(css => new Color(css));
	}

	/** The most recent guess, if any */
	get last () {
		return this.colors.at(-1);
	}

	/** Display string (gamut-mapped, primitive) of the most recent guess */
	get lastDisplay () {
		return this.last ? this.last.display() + "" : "";
	}

	/** Perceptual distance (OKLab ΔE) between target and the latest guess */
	get deltaE () {
		return this.last ? this.target.deltaE(this.last, { method: "OK" }) : null;
	}

	/** Closeness of the latest guess to the target, from 0 (far) to 1 (exact) */
	get proximity () {
		return this.deltaE === null ? 0 : Math.max(0, Math.min(1, 1 - this.deltaE));
	}

	/** Whether the latest guess is close enough to count as solved */
	get solved () {
		return this.proximity > 0.99;
	}

	/** Display strings of every guess, in order (primitives, for rendering) */
	get displays () {
		return this.colors.map(c => c.display() + "");
	}

	/** Distinct guess colors, in first-seen order */
	get unique () {
		return [...new Set(this.displays)];
	}
}
