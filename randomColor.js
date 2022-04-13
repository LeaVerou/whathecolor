import Color from "https://colorjs.io/dist/color.esm.js";

export default function getRandomColor() {

}

// Private helpers
function randomInt(max, steps) {
	steps = steps || max;

	var step = max / steps;

	return Math.round(Math.floor(Math.random() * (steps + 1))  * step);
}

function randomComponent(entropy) {
	if (entropy === 0) {
		return randomInt(255, 2);
	}
	if (entropy === 1) {
		return randomInt(255, 4);
	}
	if (entropy === 2) {
		return randomInt(255, 8);
	}
	if (entropy === 3) {
		return randomInt(255, 25.5);
	}

	return randomInt(255);
}

_.random = function(entropy) {
	return new _(randomComponent(entropy), randomComponent(entropy), randomComponent(entropy));
};