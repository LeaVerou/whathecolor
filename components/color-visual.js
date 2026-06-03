import "color-elements/color-picker";

const template = /* html */`
<color-picker ref="picker" space="oklch" :inert="disabled"></color-picker>
`;

/**
 * Visual guessing mode: a <color-picker> (from color-elements) wrapped to speak the same
 * guess protocol as the text input. Each slider step emits a guess, so the path of colors
 * dragged through is recorded just like keystrokes are in code mode.
 * Programmatic color changes (setValue, reset) do NOT fire input, so they never leak in as guesses.
 *
 * Shares an interface with guess-input.js (setValue / reset / @guess) so the app can treat
 * both modes the same. Kept mounted (toggled with v-show) so its internal state survives mode switches.
 */
export default {
	template,
	props: {
		disabled: { type: Boolean, default: false },
	},
	emits: ["guess"],

	mounted () {
		this.picker = this.$refs.picker;
		this.picker.addEventListener("input", this.onInput);
	},

	unmounted () {
		this.picker?.removeEventListener("input", this.onInput);
	},

	methods: {
		/** The picker's current color as a CSS string */
		value () {
			return this.picker.color ? this.picker.color + "" : "";
		},

		onInput () {
			this.$emit("guess", { value: this.value(), valid: true });
		},

		/** Set the picker color without emitting a guess */
		setValue (css) {
			try {
				this.picker.color = css;
			}
			catch (e) {
				// Ignore unparseable colors
			}
		},

		/** Reset for a new round to the picker's default — the midpoint of every slider, not gray */
		reset () {
			this.setValue(this.picker.defaultColor);
		},
	},
};
