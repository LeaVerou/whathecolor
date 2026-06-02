/**
 * localStorage persistence mixin for Vue apps/components.
 * Restores the named data paths on `created`, then writes them back on every change.
 *
 * @param {string|string[]|{paths: string[], prefix?: string, deep?: boolean, immediate?: boolean, emptyValue?: any}} options
 *   A single path, a list of paths, or an options object.
 * @returns {object} A Vue mixin
 *
 * @example
 * mixins: [local("history")]
 * mixins: [local({ paths: ["history"], prefix: "whathecolor/" })]
 */
export default function local (...args) {
	let options = args[0];

	if (args.length > 1 || typeof options === "string") {
		options = { paths: args };
	}

	let { paths, deep = true, immediate, prefix = "", emptyValue } = options;

	let mixin = {
		created () {
			for (let path of paths) {
				let key = this.getLocalKey(path);

				if (localStorage[key]) {
					this[path] = JSON.parse(localStorage[key]);
				}
			}
		},

		methods: {
			getLocalKey (path) {
				return prefix + path;
			},

			clearLocal (path) {
				localStorage.removeItem(this.getLocalKey(path));
				this[path] = undefined;
			},
		},

		watch: {},
	};

	for (let path of paths) {
		mixin.watch[path] = {
			handler (value) {
				let key = prefix + path;

				if (value === emptyValue) {
					delete localStorage[key];
				}
				else {
					localStorage[key] = JSON.stringify(value);
				}
			},
			deep,
			immediate,
		};
	}

	return mixin;
}
