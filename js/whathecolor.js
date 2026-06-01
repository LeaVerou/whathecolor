import { createApp, markRaw } from "vue";
import { Color, getHint } from "./util.js";
import Timer from "./timer.js";

globalThis.Color = Color;

function getUniqueAttempts (attempts) {
	return [...new Set(attempts.map(c => c.display() + ""))];
}

globalThis.app = createApp({
	data () {
		return {
			solved: false,
			guessInput: "",
			invalid: false,
			attempts: [],
			proximity: 0,
			proximityText: "0%",
			proximityTitle: "",
			hint: "",
			solutionCss: "",
			yourcolorCss: "",
			timerText: "00:00.0",
			showSlow: false,
			history: [],
			totalTime: 0,

			// Non-reactive holders, (re)assigned in play()
			solution: null,
			timer: null,
			timerStarted: false,
		};
	},

	computed: {
		uniqueCount () {
			return getUniqueAttempts(this.attempts).length;
		},

		avgTime () {
			let t = new Timer();
			t.ms100 = this.history.length ? Math.round(this.totalTime / this.history.length) : 0;
			return t.toString();
		},

		totalTimeStr () {
			let t = new Timer();
			t.ms100 = this.totalTime;
			return t.toString();
		},

		tweetHref () {
			let count = this.history.length;

			if (!count) {
				return "https://twitter.com/intent/tweet?text=";
			}

			let text = `I guessed ${ count } color${ count > 1 ? "s" : "" } correctly in ${ this.totalTimeStr } on #whathecolor!
Can you beat my average of ${ this.avgTime } per color?

https://whathecolor.com by @LeaVerou`;

			return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
		},
	},

	methods: {
		play () {
			this.solved = false;
			this.hint = "";
			this.showSlow = false;
			this.attempts = [];
			this.proximity = 0;
			this.proximityText = "0%";
			this.proximityTitle = "";
			this.invalid = false;
			this.guessInput = "";
			this.yourcolorCss = "";

			let color = new Color("srgb", [
				Math.random(),
				Math.random(),
				Math.random()
			]);

			this.solution = markRaw(color);
			this.solutionCss = color.toString();

			this.timer?.stop();
			this.timer = markRaw(new Timer(text => { this.timerText = text; }));
			this.timerText = "00:00.0";
			this.timerStarted = false;

			this.$nextTick(() => this.$refs.attempt?.focus());
		},

		onInput (e) {
			this.guessInput = e.target.value;

			if (this.solved) {
				return;
			}

			// Start the timer on the first input
			if (!this.timerStarted) {
				this.timer.start();
				this.timerStarted = true;
			}

			this.yourcolorCss = "";

			let guess, guessMeta = {}, isValid;
			try {
				guess = Color.parse(this.guessInput, {meta: guessMeta});
				guess = new Color(guess); // better to have a color object
				isValid = true;
			}
			catch (err) {
				isValid = false;
			}

			this.invalid = !isValid;

			if (isValid) {
				this.hint = getHint({meta: guessMeta, color: guess});
			}
			else {
				let functionName = this.guessInput.match(/^\w+(?=\()/)?.[0];

				if (functionName) {
					this.hint = getHint({formatId: functionName});
				}

				return;
			}

			guess = markRaw(guess);
			this.yourcolorCss = guess.display();

			this.attempts.push(guess);

			if (this.timer.minutes >= 3) {
				this.showSlow = true;
			}

			let deltaE = this.solution.deltaE(guess, {method: "OK"});
			let prox = 1 - deltaE;

			this.proximity = prox;
			this.proximityText = `${ Math.round(prox * 1000) / 10 }%`;
			this.proximityTitle = `DeltaE OK = ${ deltaE }`;

			if (prox > .99) {
				// You won!
				this.timer.stop();
				this.solved = true;
				this.showSlow = false;
				this.historyPush();
			}
		},

		historyPush () {
			let solution = this.solution;
			let timer = this.timer;
			let attempts = getUniqueAttempts(this.attempts);

			let attemptGradient = `linear-gradient(to right, ${ attempts.map((c, i) => `${ c } 0 ${ (i + 1) / attempts.length * 100 }%`).join(", ") })`;
			let css = `background-color: ${ solution }; background-image: ${ attemptGradient };`;

			if (solution.get("oklch.lightness") <= .55) {
				css += " color: white;";
			}

			this.totalTime += timer.ms100;

			this.history.push({
				css,
				time: timer.toString(),
				attempts: attempts.length,
			});
		},
	},

	mounted () {
		this.play();

		import("https://incrementable.verou.me/incrementable.js").then(module => new module.default(this.$refs.attempt));
	},
}).mount("#app");
