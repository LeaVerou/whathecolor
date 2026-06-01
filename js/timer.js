export default class Timer {
	constructor (onTick) {
		this.onTick = onTick;
		this.ms100 = 0;
	}

	get seconds () {
		return (this.ms100 % 600) / 10 << 0;
	}

	get minutes () {
		return this.ms100 / 600 << 0;
	}

	start () {
		this.interval = setInterval(() => {
			this.ms100 += 1;
			this.onTick?.(this.toString());
		}, 100);
	}

	stop () {
		clearInterval(this.interval);
	}

	toString () {
		let mm = (this.minutes + '').padStart(2, '0');
		let ss = (this.seconds + '').padStart(2, '0');
		let ms100 = this.ms100 % 10;
		return `${ mm }:${ ss }.${ ms100 }`;
	}
}
