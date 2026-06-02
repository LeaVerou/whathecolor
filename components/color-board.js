const template = /* html */`
<div class="colors">
	<div class="color solution" title="Color to guess" :style="{ background: target }"></div>
	<div class="color your-color" title="Your guess" :style="{ background: guess }"></div>
	<output class="proximity" :class="{ success: solved }" data-label="Proximity"
		:style="{ '--proximity': proximity }" :title="deltaTitle">{{ percent }}</output>
</div>
`;

/**
 * The pair of swatches (target + your guess) with the proximity readout.
 * Purely presentational: all game logic lives in the root app.
 */
export default {
	template,
	props: {
		/** CSS color string of the color to guess */
		target: { type: String, required: true },
		/** CSS color string of the current guess, or "" to show the empty checkerboard */
		guess: { type: String, default: "" },
		/** Closeness 0–1 */
		proximity: { type: Number, default: 0 },
		/** Raw OKLab ΔE, shown as a tooltip */
		deltaE: { type: Number, default: null },
		solved: { type: Boolean, default: false },
	},

	computed: {
		percent () {
			return Math.round(this.proximity * 1000) / 10 + "%";
		},

		deltaTitle () {
			return this.deltaE == null ? null : `DeltaE OK = ${this.deltaE}`;
		},
	},
};
