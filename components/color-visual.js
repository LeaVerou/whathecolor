import "color-elements/color-picker";

const template = /* html */`
<color-picker ref="picker" space="oklch" :inert="disabled"></color-picker>
`;

/**
 * The color picker: a <color-picker> (from color-elements) wrapped to emit guesses.
 * Each slider step emits a guess, so the whole path of colors dragged through is recorded.
 * Programmatic color changes (reset) do NOT fire input, so they never leak in as guesses.
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
