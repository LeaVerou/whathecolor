import Color from "colorjs.io";
import { getHint } from "../lib/hint.js";

const template = /* html */`
<div class="guess-input">
	<input ref="input" name="guess" aria-label="Your color guess" :value="value"
		:class="{ invalid: !valid }" :disabled="disabled"
		placeholder="rgb(), hsl() etc" autocomplete="off" autocapitalize="off" spellcheck="false"
		@input="onInput">
	<code class="hint popup" v-html="hint"></code>
</div>
`;

/**
 * Code guessing mode: the color text field. Owns parsing of the typed value (validity +
 * syntax hint) and emits each keystroke up to the app as a guess. Enhanced with
 * incrementable.js so ↑/↓ tweak the number under the caret.
 *
 * Shares an interface with color-visual.js (setValue / reset / focus / @guess) so the app can
 * treat both modes the same.
 */
export default {
	template,
	props: {
		disabled: { type: Boolean, default: false },
	},
	emits: ["guess"],

	data () {
		return {
			value: "",
			valid: true,
			hint: "",
		};
	},

	mounted () {
		// Arrow-key increment/decrement of CSS values. External, optional enhancement.
		import("https://incrementable.verou.me/incrementable.js")
			.then(module => new module.default(this.$refs.input))
			.catch(() => {});
	},

	methods: {
		/** Update validity + syntax hint from the current value. Does not emit. */
		parse () {
			let meta = {};
			let color;
			let valid;

			try {
				color = new Color(Color.parse(this.value, { meta }));
				valid = true;
			}
			catch (e) {
				valid = false;
			}

			this.valid = valid;

			if (valid) {
				this.hint = getHint({ meta, color });
			}
			else {
				// Even when the whole value is invalid, hint at the syntax of the function being typed
				let functionName = this.value.match(/^\w+(?=\()/)?.[0];
				this.hint = functionName ? getHint({ formatId: functionName }) : "";
			}

			return valid;
		},

		onInput (event) {
			this.value = event.target.value;
			let valid = this.parse();
			this.$emit("guess", { value: this.value, valid });
		},

		/** Set the field value without emitting (e.g. carrying a guess over from visual mode) */
		setValue (css) {
			this.value = css;
			this.parse();
		},

		focus () {
			this.$refs.input.focus();
		},

		/** Clear the field for a new round */
		reset () {
			this.value = "";
			this.valid = true;
			this.hint = "";
		},
	},
};
