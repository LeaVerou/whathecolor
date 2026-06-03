import Color from "colorjs.io";
import Timer from "../lib/timer.js";

const template = /* html */`
<aside class="successes">
	<header>{{ count }} {{ count === 1 ? 'color' : 'colors' }}, {{ avg }} avg, {{ total }} total</header>
	<div class="history">
		<article class="color" v-for="(entry, i) in history" :key="i" :style="entryStyle(entry)">
			<span class="time">{{ time(entry) }}</span>
			<span class="icon mode-icon" :style="{ '--icon': modeIcon(entry.mode) }"
				:title="entry.mode === 'code' ? 'Guessed in code' : 'Guessed visually'"></span>
		</article>
	</div>
	<button class="share" v-if="count" @click="share">Share score</button>
</aside>
`;

/**
 * @typedef {object} HistoryEntry
 * @property {string} color - CSS string of the solved color
 * @property {number} ms100 - Time taken, in tenths of a second
 * @property {string[]} attempts - Distinct guess colors made, in order
 */

/**
 * The score panel: one card per solved color (tinted with the target color and a gradient of the
 * guesses that led to it), aggregate stats in the header, and a Share button.
 */
export default {
	template,
	props: {
		/** @type {() => HistoryEntry[]} */
		history: { type: Array, default: () => [] },
	},

	computed: {
		count () {
			return this.history.length;
		},

		/** Total time across all solved colors */
		totalMs100 () {
			return this.history.reduce((sum, entry) => sum + entry.ms100, 0);
		},

		total () {
			return new Timer(this.totalMs100).toString();
		},

		avg () {
			let ms100 = this.count ? Math.round(this.totalMs100 / this.count) : 0;
			return new Timer(ms100).toString();
		},

		shareText () {
			return `I guessed ${this.count} color${this.count === 1 ? "" : "s"} correctly in ${this.total} on #whathecolor!
Can you beat my average of ${this.avg} per color?`;
		},
	},

	methods: {
		time (entry) {
			return new Timer(entry.ms100).toString();
		},

		/** Which guessing mode this color was solved in */
		modeIcon (mode) {
			return mode === "code" ? "var(--icon-braces)" : "var(--icon-sliders)";
		},

		/** Per-card style: solid target color, overlaid with a gradient of the distinct guesses */
		entryStyle (entry) {
			let attempts = entry.attempts;
			let gradient = `linear-gradient(to right, ${
				attempts.map((c, i) => `${c} 0 ${(i + 1) / attempts.length * 100}%`).join(", ")
			})`;

			let style = {
				backgroundColor: entry.color,
				backgroundImage: gradient,
			};

			// White text on dark colors for legibility
			if (new Color(entry.color).get("oklch.lightness") <= 0.55) {
				style.color = "white";
			}

			return style;
		},

		async share () {
			let url = "https://whathecolor.com";

			if (navigator.share) {
				try {
					await navigator.share({ text: this.shareText, url });
					return;
				}
				catch (e) {
					// User cancelled or sharing failed — fall through to the link fallback
					if (e.name === "AbortError") {
						return;
					}
				}
			}

			let text = encodeURIComponent(`${this.shareText}\n\n${url} by @LeaVerou`);
			window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
		},
	},
};
