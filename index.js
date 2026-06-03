import { createApp, markRaw } from "vue";
import Color from "colorjs.io";
import Round from "./lib/round.js";
import Timer from "./lib/timer.js";
import local from "./lib/local.js";
import ColorBoard from "./components/color-board.js";
import GuessInput from "./components/guess-input.js";
import ColorVisual from "./components/color-visual.js";
import Progression from "./components/progression.js";
import HistoryPanel from "./components/history-panel.js";

// Handy for poking around in the console
globalThis.Color = Color;

// Minutes after which we offer to skip a stubborn color
const SLOW_MINUTES = 3;

const app = createApp({
	mixins: [
		local({ paths: ["history", "mode"], prefix: "whathecolor/" }),
	],

	data () {
		return {
			solution: "",       // CSS string of the color to guess
			attempts: [],       // Guesses, in order
			guessValid: true,   // Whether the latest guess is a valid color
			elapsed: 0,         // Time on the clock, in tenths of a second
			started: false,     // Whether the clock is running
			solved: false,      // Whether the current round is won
			mode: "visual",     // "visual" (color picker) or "code" (text input)
			history: [],        // Solved colors (persisted)
		};
	},

	computed: {
		/** Derived view of the current round. markRaw so Vue doesn't wrap live Color objects. */
		round () {
			return markRaw(new Round(this.solution, this.attempts));
		},

		/** Your-color swatch: the latest guess while valid, else empty (checkerboard) */
		guessColor () {
			return this.guessValid ? this.round.lastDisplay : "";
		},

		/** The latest guess as typed/picked, to carry across a mode switch */
		lastGuess () {
			return this.attempts.at(-1) ?? "";
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

		// Both inputs stay mounted (v-show); on switch, carry the latest guess into the now-active one
		mode () {
			this.$nextTick(() => {
				let active = this.mode === "visual" ? this.$refs.visualGuesser : this.$refs.codeGuesser;
				if (this.lastGuess) {
					active?.setValue(this.lastGuess);
				}
				active?.focus?.();
			});
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
			this.guessValid = true;
			this.$refs.visualGuesser?.reset();
			this.$refs.codeGuesser?.reset();
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
		 * Handle a guess from whichever input is active (a keystroke in code mode, a slider
		 * step in visual mode). Every distinct valid guess is recorded, so the progression and
		 * counters reflect the whole path; the latest one drives proximity, the swatch, and the win.
		 */
		onGuess ({ value, valid }) {
			this.startClock();

			if (this.solved) {
				return;
			}

			this.guessValid = valid;

			// Skip consecutive duplicates (e.g. a no-op keystroke or a slider that didn't move)
			if (valid && value !== "" && value !== this.attempts.at(-1)) {
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
		"guess-input": GuessInput,
		"color-visual": ColorVisual,
		"progression": Progression,
		"history-panel": HistoryPanel,
	},
});

// <color-picker> (from color-elements) is a real custom element, not a Vue component
app.config.compilerOptions.isCustomElement = tag => tag === "color-picker";

globalThis.app = app.mount(document.body);
