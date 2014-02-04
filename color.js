/*
	A class for manipulating colors, tailored to whathecolor
	Lea Verou - http://lea.verou.me
	MIT license
*/

(function() {

var _ = self.Color = function (red, green, blue) {
	if (Array.isArray(arguments[0])) {
		this.rgb = arguments[0];
	}
	else if (typeof arguments[0] == 'string') {
		this.rgb = _.fromString(arguments[0]).rgb;
	}
	else {
		this.red = red;
		this.green = green;
		this.blue = blue;
	}
};

_.prototype = {
	get rgb () {
		return [this.red, this.green, this.blue];
	},
	
	set rgb(arr) {
		this.red = arr[0];
		this.green = arr[1];
		this.blue = arr[2];
	},
	
	get hsl () {
		var rgb = this.rgb.map(function(a) { return a / 2.55 });
		
		var hsl = [],
			max = Math.max.apply(Math, rgb),
			min = Math.min.apply(Math, rgb);
			
		hsl[2] = Math.round((min + max)/2);
		
		var d = max - min;
		
		if(d !== 0) {
			hsl[1] = Math.round(d*100 / (100 - Math.abs(2*hsl[2] - 100)));
			
			switch(max){
				case rgb[0]: hsl[0] = (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0); break;
				case rgb[1]: hsl[0] = (rgb[2] - rgb[0]) / d + 2; break;
				case rgb[2]: hsl[0] = (rgb[0] - rgb[1]) / d + 4;
			}
			
			hsl[0] = Math.round(hsl[0]*60);
		}
		else {
			hsl[0] = 0;
			hsl[1] = 0;
		}
		
		return hsl;
	},
	
	// Euclidean distance of the two colors in the RGB cube
	distance: function (color) {
		var dr = this.red - color.red;
		var dg = this.green - color.green;
		var db = this.blue - color.blue;
		
		return Math.sqrt(dr*dr + dg*dg + db*db);
	},
	
	get maxDistance () {
		var rgb = this.rgb;
		
		rgb = rgb.map(function(c) {
			return c < 127.5? 255 : 0;
		});
		
		var farthest = new Color(rgb);
		
		return this.distance(new Color(rgb));
	},
	
	toString: function () {
		return 'rgb(' + [this.red, this.green, this.blue].join(',') + ')';
	},
	
	// A number 0-1 representing how close we are to the current color
	proximity: function (color) {
		var maxDistance = this.maxDistance;
		var distance = this.distance(color);
		
		return 1 - distance/maxDistance;
	},
	
	proximityHSL: function (color) {
		var hsl = this.hsl;
		var hsl2 = color.hsl;
		
		var dh = Math.abs(hsl[0] - hsl2[0])/360;
		var ds = Math.abs(hsl[1] - hsl2[1])/Math.max(100 - hsl[1], hsl[1]);
		var dl = Math.abs(hsl[2] - hsl2[2])/Math.max(100 - hsl[2], hsl[2]);
		
		// Greys
		if (hsl[1] === 0) {
			return 1 - ds;
		}
		
		// Black & white
		if (hsl[2] === 0 || hsl[2] === 100) {
			return 1 - dh;
		}
		
		return 1- (dh + ds + dl)/3;
	}
};

_.random = function(entropy) {
	return new _(randomComponent(entropy), randomComponent(entropy), randomComponent(entropy));
};

_.fromString = function(str) {
	var dummy = document.createElement('div');
	dummy.style.color = str;
	
	// Is the syntax valid?
	if (!dummy.style.color) {
		return null;
	}
	
	document.head.appendChild(dummy);
	
	var normalized = getComputedStyle(dummy).color;
	
	document.head.removeChild(dummy);
	
	if (!normalized) {
		return null;
	}
	
	var rgb = normalized.match(/\((\d+), (\d+), (\d+)/);

	return new _(+rgb[1], +rgb[2], +rgb[3]);
};

_.WHITE = new _(255,255,255);
_.BLACK = new _(0,0,0);

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

})();

