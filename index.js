import { createApp, markRaw } from "vue";
import Color from "colorjs.io";
import "color-elements/color-picker";
import Round from "./lib/round.js";
import Timer from "./lib/timer.js";
import local from "./lib/local.js";
import ColorBoard from "./components/color-board.js";
import Progression from "./components/progression.js";
import HistoryPanel from "./components/history-panel.js";

// Handy for poking around in the console
globalThis.Color = Color;

// Minutes after which we offer to skip a stubborn color
const SLOW_MINUTES = 3;

const app = createApp({
	mixins: [
		local({ paths: ["history"], prefix: "whathecolor/" }),
	],

	data () {
		return {
			solution: "",       // CSS string of the color to guess
			attempts: [],       // Guesses, in order
			elapsed: 0,         // Time on the clock, in tenths of a second
			started: false,     // Whether the clock is running
			solved: false,      // Whether the current round is won
			history: [],        // Solved colors (persisted)
		};
	},

	computed: {
		/** Derived view of the current round. markRaw so Vue doesn't wrap live Color objects. */
		round () {
			return markRaw(new Round(this.solution, this.attempts));
		},

		/** Your-color swatch: the latest guess, or "" before any guess (checkerboard) */
		guessColor () {
			return this.round.lastDisplay;
		},

		proximity () {
			return this.round.proximity;
		},

		deltaE () {
			return this.round.deltaE;
		},

		displays () {
			return this.round.displays;
		},

		timer () {
			return new Timer(this.elapsed);
		},

		/** Offer to skip once a color has taken a while and isn't solved yet */
		showSlow () {
			return this.started && !this.solved && this.timer.minutes >= SLOW_MINUTES;
		},
	},

	watch: {
		// Detect the moment the live guess becomes close enough to win
		"round.solved" (isSolved) {
			if (isSolved && !this.solved) {
				this.win();
			}
		},
	},

	mounted () {
		this.newRound();
	},

	methods: {
		/** Start a fresh round with a random color */
		newRound () {
			this.stopClock();
			let color = new Color("srgb", [Math.random(), Math.random(), Math.random()]);
			this.solution = color.toString();
			this.attempts = [];
			this.elapsed = 0;
			this.started = false;
			this.solved = false;
			// Reset the picker to its neutral default (the midpoint of every slider).
			// Setting .color programmatically doesn't fire `input`, so it isn't recorded as a guess.
			let picker = this.$refs.picker;
			if (picker) {
				picker.color = picker.defaultColor;
			}
		},

		/** Skip the current (unsolved) color */
		skip () {
			this.newRound();
		},

		/** Start the clock on the first input */
		startClock () {
			if (this.started || this.solved) {
				return;
			}
			this.started = true;
			this.interval = setInterval(() => this.elapsed++, 100);
		},

		stopClock () {
			clearInterval(this.interval);
			this.interval = null;
		},

		/**
		 * Record a guess from the color picker on every slider step. Distinct guesses build the
		 * progression; the latest drives proximity, the swatch, and win detection.
		 */
		onPick () {
			this.startClock();

			if (this.solved) {
				return;
			}

			let value = this.$refs.picker.color + "";

			// Skip consecutive duplicates (a slider that didn't actually move)
			if (value && value !== this.attempts.at(-1)) {
				this.attempts.push(value);
			}
		},

		win () {
			this.solved = true;
			this.stopClock();
			this.history.push({
				color: this.solution,
				ms100: this.elapsed,
				attempts: this.round.unique,
			});
		},
	},

	components: {
		"color-board": ColorBoard,
		"progression": Progression,
		"history-panel": HistoryPanel,
	},
});

// <color-picker> (from color-elements) is a real custom element, not a Vue component
app.config.compilerOptions.isCustomElement = tag => tag === "color-picker";

globalThis.app = app.mount(document.body);
