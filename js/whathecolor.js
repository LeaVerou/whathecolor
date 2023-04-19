import Color from "https://colorjs.io/color.js";
import { $, $$ } from "./util.js";
import Timer from "./timer.js";

globalThis.Color = Color;

// Beware, awful code lies ahead
let t; // Variable to hold timer

// Color attempts
let attempts;

let _ = self.Whathecolor = {
	solved: false,

	play: function () {
		_.solved = false;

		let color = new Color("srgb", [
			Math.random(),
			Math.random(),
			Math.random()
		]);

		solution.style.background = color;

		t?.stop()
		t = new Timer(timer);
		t.start();

		// Clean up from previous attempts
		proximity.textContent = '0%';
		attempt.value = '';
		yourcolor.style.background = '';
		attempts = [];

		attempt.focus();

		attempt.oninput = function () {
			if (_.solved) {
				return;
			}

			yourcolor.style.background = "";

			let guess;
			try {
				guess = new Color(this.value);
				this.classList.remove('invalid');
			}
			catch (e) {
				this.classList.add('invalid');
				return;
			}

			yourcolor.style.background = guess.display();

			attempts.push(guess);

			if (t.minutes >= 3) {
				slow.classList.add('show');
			}

			let deltaE = color.deltaE(guess, {method: "OK"});
			let prox = 1 - deltaE;

			proximity.textContent = `${Math.round(prox * 1000)/10}%`;
			proximity.title = `DeltaE OK = ${deltaE}`;

			progression.innerHTML = attempts.map(c => `<div style="background: ${c.display()}"></div>`).join('');

			if (prox > .99) {
				// You won!
				t.stop();
				proximity.className = 'success';
				slow.classList.remove('show');
				success.classList.add('show');
				_.historyPush(color, t);
				_.solved = true;

				return;
			}

			// Try harder!
			proximity.className = 'close-' + Math.floor(prox * 10)*10 + '%';
		}

		return false;
	},

	historyPush: function(color, t) {
		let c = document.createElement('article');
		c.className = 'color';
		c.style.background = color;
		c.textContent = t + '';

		if (color.lightness <= 55) {
			c.style.color = 'white';
		}

		successes.insertBefore(c, successes.firstChild);
		successes.classList.add('show');

		_.history.push({color: color, timer: t});
		_.totalTime += t.ms100;

		tweet.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(_.tweet());
	},

	tweet: function () {
		let total = _.history.length;

		let t = new Timer();
		t.ms100 = _.totalTime;

		let avg = new Timer();
		avg.ms100 = Math.round(_.totalTime/total);

		return `I guessed ${total} color${total > 1? 's' : ''} correctly in ${t} on #whathecolor!
Can you beat my average of ${avg} per color?
https://whathecolor.com by @LeaVerou`
	},

	history: [],

	totalTime: 0
};

import("https://incrementable.verou.me/incrementable.js").then(module => new module.default(attempt));


$$('.message a').forEach(a => a.onclick = Whathecolor.play);
