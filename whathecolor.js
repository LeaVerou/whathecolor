function $(expr, con) {
	return typeof expr === 'string'? (con || document).querySelector(expr) : expr;
}

function $$(expr, con) {
	return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}

if (!('requestAnimationFrame' in window)) {
	window.requestAnimationFrame = window.mozRequestAnimationFrame ||
	                               window.webkitRequestAnimationFrame ||
	                               window.msRequestAnimationFrame ||
	                               function (callback) {
	                               		return setTimeout(callback, 0);
	                               }
}

// Make each ID a global variable
// Many browsers do this anyway (it’s in the HTML5 spec), so it ensures consistency
$$('[id]').forEach(function(element) { window[element.id] = element; });

function play() {
	var color = new Color(255, 128, 255);
	var color = Color.random();
	
	solution.style.background = color;
	
	var t = new Timer(timer);
	t.start();
	
	attempt.oninput = function () {
		yourcolor.style.background = this.value;
		
		var guess = Color.fromString(this.value);
		
		if (!guess) {
			this.className = 'invalid';
			return;
		}
		this.className = '';
		
		var prox = (color.proximity(guess) + color.proximityHSL(guess))/2;
		
		proximity.textContent = (prox > .9? Math.round(prox * 10000)/100 : Math.round(prox * 1000)/10) + '%';
		
		if (prox > .99) {
			proximity.className = 'success';
			t.stop();
		}
		else {
			proximity.className = 'close-' + Math.floor(prox * 10)*10 + '%';
		}
	}
}

(function(){

var _ = self.Timer = function (element) {
	this.timer = element;
	this.timer.textContent = '00:00.0';
	this.ms100 = 0;
}

_.prototype = {
	start: function () {
		var me = this;
		
		this.interval = setInterval(function name() {
			me.ms100 += 1;
			
			requestAnimationFrame(function () {
				var minutes = me.ms100 / 600 << 0;
				var seconds = (me.ms100 % 600) / 10 << 0;
				var ms100 = me.ms100 % 10;
				
				me.timer.textContent = pad(minutes,2) + ':' + pad(seconds,2) + '.' + ms100;
			});
		}, 100);
	},
	
	stop: function () {
		clearInterval(this.interval);
	}
};

// Private helpers
function pad(number, zeros) {
	var numstr = number + '';
	
	if (numstr.length < zeros) {
		numstr = Array(zeros - numstr.length + 1).join('0') + numstr;
	}
	
	return numstr;
}

})();

incrementable.onload = function() {
	if (window.Incrementable) {
		new Incrementable(attempt);
	}
};

if (window.Incrementable) {
	incrementable.onload();
}

play();