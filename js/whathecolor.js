
import { $, $$, Color, getHint } from "./util.js";
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
		hint.innerHTML = "";
		success.classList.remove('show');

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

			let guess, guessMeta = {}, isValid;
			try {
				guess = Color.parse(this.value, {meta: guessMeta});
				guess = new Color(guess); // better to have a color object
				isValid = true;
			}
			catch (e) {
				isValid = false;
			}

			this.classList.toggle('invalid', !isValid);

			if (isValid) {
				hint.innerHTML = getHint({meta: guessMeta, color: guess});
			}
			else {
				let functionName = this.value.match(/^\w+(?=\()/)?.[0];

				if (functionName) {
					hint.innerHTML = getHint({formatId: functionName});
				}
			}

			if (!isValid) {
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

				_.historyPush(color, t, attempts);
				_.solved = true;

				return;
			}

			// Try harder!
			proximity.className = 'close-' + Math.floor(prox * 10)*10 + '%';
		}

		return false;
	},

	historyPush: function(color, t, attempts) {
		let css = `background: ${color};`;

		if (color.get("oklch.lightness") <= .55) {
			css += " color: white;"
		}

		document.querySelector("#successes > div").insertAdjacentHTML("beforeend",
			`<article class="color" style="${css}">${t}</article>`);

		_.history.push({color: color, timer: t, attempts: attempts.slice()});
		_.totalTime += t.ms100;

		let total =  _.history.length;

		this.avg ??= new Timer();
		this.avg.ms100 = Math.round(_.totalTime/total);

		this.total ??= new Timer();
		this.total.ms100 = _.totalTime;

		document.querySelector("#successes > header").innerHTML = `
			<strong>${ total }</strong> color${ total > 1? 's' : '' },
			<strong>${ this.avg }</strong> avg,
			<strong>${ this.total }</strong> total`

		tweet.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(_.tweet());
	},

	tweet: function () {
		let count = _.history.length;

		return `I guessed ${count} color${count > 1? 's' : ''} correctly in ${ this.total } on #whathecolor!
Can you beat my average of ${ this.avg } per color?

https://whathecolor.com by @LeaVerou`
	},

	history: [],

	totalTime: 0
};

import("https://incrementable.verou.me/incrementable.js").then(module => new module.default(attempt));


$$('.message a').forEach(a => a.onclick = Whathecolor.play);
