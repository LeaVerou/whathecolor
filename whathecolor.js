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

(function(){

var _ = self.Timer = function (element) {
	if (element) {
		this.timer = element;
		this.timer.textContent = '00:00.0';
	}
	
	this.ms100 = 0;
}

_.prototype = {
	get seconds () {
		return (this.ms100 % 600) / 10 << 0;
	},
	
	get minutes () {
		return this.ms100 / 600 << 0;
	},
	
	start: function () {
		var me = this;
		
		this.interval = setInterval(function name() {
			me.ms100 += 1;
			
			requestAnimationFrame(function () {
				me.timer.textContent = me.toString();
			});
		}, 100);
	},
	
	stop: function () {
		clearInterval(this.interval);
	},
	
	toString: function () {
		return pad(this.minutes,2) + ':' +
		       pad(this.seconds,2) + '.' +
		       (this.ms100 % 10);
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

(function(){

// Beware, awful code lies ahead
var t_; // Variable to hold timer

var _ = self.Whathecolor = {
	solved: false,
	
	play: function () {
		_.solved = false;
		
		var color = Color.random();
		
		solution.style.background = color;
		
		t_ && t_.stop()
		t_ = new Timer(timer);
		t_.start();
		
		// Clean up from previous attempts
		proximity.textContent = '0%';
		attempt.value = '';
		yourcolor.style.background = '';
		
		attempt.focus();
		
		attempt.oninput = function () {
			if (_.solved) {
				return;
			}
			
			yourcolor.style.background = this.value;
			
			var guess = Color.fromString(this.value);
			
			if (t.minutes >= 3) {
				slow.classList.add('show');
			}
			
			if (!guess) {
				this.classList.add('invalid');
				return;
			}
			this.classList.remove('invalid');
			
			var prox = (color.proximity(guess) + color.proximityHSL(guess))/2;
			
			proximity.textContent = (prox > .9? Math.round(prox * 10000)/100 : Math.round(prox * 1000)/10) + '%';
			
			if (prox > .992) {
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
		var c = document.createElement('article');
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
		var total = _.history.length;
		
		var t = new Timer();
		t.ms100 = _.totalTime;
		
		var avg = new Timer();
		avg.ms100 = Math.round(_.totalTime/total);
		
		var text = 'I guessed ' +
		 total + ' color' + (total > 1? 's' : '') +
		 ' correctly in ' + t + ' on #whathecolor! Can you beat my average of ' +
		 avg + ' per color? ' + location.href + ' by @LeaVerou';
		
		return text;
	},
	
	history: [],
	
	totalTime: 0
};

})();

incrementable.onload = function() {
	if (window.Incrementable) {
		new Incrementable(attempt);
	}
};

if (window.Incrementable) {
	incrementable.onload();
}


$$('.message a').forEach(function(a) {
	a.onclick = Whathecolor.play;
});