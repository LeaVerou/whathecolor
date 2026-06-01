(()=>{
/* Nudeps v0.2.4 */
let cS = document.currentScript;
let mapUrl = cS?.src;
let map = {
	"imports": {
		"colorjs.io": "./client_modules/colorjs.io@0.5.2/dist/color.js",
		"colorjs.io/fn": "./client_modules/colorjs.io@0.5.2/src/index-fn.js",
		"colorjs.io/dist/": "./client_modules/colorjs.io@0.5.2/dist/",
		"vue": "./client_modules/vue@3.5.35/dist/vue.esm-browser.prod.js",
		"vue/compiler-sfc": "./client_modules/vue@3.5.35/compiler-sfc/index.browser.mjs",
		"vue/jsx": "./client_modules/vue@3.5.35/jsx.d.ts",
		"vue/jsx-dev-runtime": "./client_modules/vue@3.5.35/jsx-runtime/index.mjs",
		"vue/jsx-runtime": "./client_modules/vue@3.5.35/jsx-runtime/index.mjs",
		"vue/package.json": "./client_modules/vue@3.5.35/package.json",
		"vue/server-renderer": "./client_modules/vue@3.5.35/server-renderer/index.mjs",
		"vue/dist/": "./client_modules/vue@3.5.35/dist/",
		"@vue/compiler-dom": "./client_modules/@vue/compiler-dom@3.5.35/dist/compiler-dom.esm-bundler.js",
		"@vue/compiler-sfc": "./client_modules/@vue/compiler-sfc@3.5.35/dist/compiler-sfc.esm-browser.js",
		"@vue/runtime-dom": "./client_modules/@vue/runtime-dom@3.5.35/dist/runtime-dom.esm-browser.js",
		"@vue/server-renderer": "./client_modules/@vue/server-renderer@3.5.35/dist/server-renderer.esm-bundler.js",
		"@vue/shared": "./client_modules/@vue/shared@3.5.35/dist/shared.esm-bundler.js",
		"@vue/compiler-core": "./client_modules/@vue/compiler-core@3.5.35/dist/compiler-core.esm-bundler.js"
	},
	"scopes": {}
};
if (!mapUrl && !cS) {
	throw new Error('nudeps: Import map script appears to be loaded as a module. Set module: true in nudeps config, or remove type="module" from the script tag.');
}
if (document.querySelector("script[type=module]")) {
	console.warn("nudeps: " + cS.getAttribute("src") + " is included after module scripts, which is not supported in all browsers.");
}
const rebase = m => { for (let k in m) m[k] = new URL(m[k], mapUrl).href; return m; };
rebase(map.imports);
for (let scope in map.scopes) rebase(map.scopes[scope]);
let script = Object.assign(document.createElement("script"), { type: "importmap", textContent: JSON.stringify(map) });
if (cS) cS.after(script);
else (document.head ?? document.documentElement).append(script);
})();