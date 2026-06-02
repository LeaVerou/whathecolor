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
 * The color guess field. Owns parsing of the typed value (validity + syntax hint) and
 * emits each keystroke's result up to the app, which decides what to do with it.
 * Enhanced with incrementable.js so ↑/↓ tweak the number under the caret.
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
		this.$refs.input.focus();

		// Arrow-key increment/decrement of CSS values. External, optional enhancement.
		import("https://incrementable.verou.me/incrementable.js")
			.then(module => new module.default(this.$refs.input))
			.catch(() => {});
	},

	methods: {
		onInput (event) {
			this.value = event.target.value;

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

			this.$emit("guess", { value: this.value, valid });
		},

		/** Clear the field for a new round */
		reset () {
			this.value = "";
			this.valid = true;
			this.hint = "";
			this.$refs.input.focus();
		},
	},
};
