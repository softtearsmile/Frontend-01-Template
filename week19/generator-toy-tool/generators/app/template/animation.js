export class Timeline {
	constructor() {
		this.animations = new Set();
		this.finishedAnimations = new Set();
		this.addTimes = new Map();
		this.requsetId = null;
		this.state = "inited";
		this.pauseTime = null;
	}
	tick() {
		let t = Date.now() - this.startTime;

		for (let animation of this.animations) {
			let {
				object,
				property,
				template,
				duration,
				delay,
				timingFunction,
			} = animation;
			// console.log(object);
			// console.log(property);

			let addTime = this.addTimes.get(animation);

			if (t < delay + addTime) continue;

			let progression = timingFunction((t - delay - addTime) / duration); // 0-1之间的数

			if (t > duration + delay + addTime) {
				progression = 1;
				this.animations.delete(animation);
				this.finishedAnimations.add(animation);
			}

			let value = animation.valueFromProgression(progression); // value就是根据progression算出的当前值
			object[property] = template(value);
		}

		if (this.animations.size) {
			this.requsetId = requestAnimationFrame(() => this.tick());
		} else {
			this.requsetId = null;
		}
	}

	start() {
		if (this.state !== "inited") {
			return;
		}
		this.state = "playing";
		this.startTime = Date.now();
		this.tick();
	}

	reset() {
		if (this.state === "playing") {
			this.pause();
		}
		this.animations = new Set();
		this.finishedAnimations = new Set();
		this.addTimes = new Map();
		this.requsetId = null;
		this.state = "inited";
		this.startTime = Date.now();
		this.pauseTime = null;
	}

	restart() {
		if (this.state === "playing") {
			this.pause();
		}

		for (let animation of this.finishedAnimations) {
			this.animations.add(animation);
		}

		this.finishedAnimations = new Set();
		this.requsetId = null;
		this.state = "playing";
		this.startTime = Date.now();
		this.pauseTime = null;
		this.tick();
	}

	pause() {
		if (this.state !== "playing") {
			return;
		}
		if (this.requsetId != null) {
			this.state = "paused";
			this.pauseTime = Date.now();
			cancelAnimationFrame(this.requsetId);
			this.requsetId = null;
		}
	}

	resume() {
		if (this.state !== "paused") {
			return;
		}
		this.state = "playing";
		this.startTime += Date.now() - this.pauseTime;
		this.tick();
	}

	add(animation, addTime) {
		if (this.state === "playing") {
			this.addTimes.set(
				animation,
				addTime != null ? addTime : Date.now() - this.startTime
			);
		} else {
			this.addTimes.set(animation, addTime != null ? addTime : 0);
		}

		this.animations.add(animation);
		if (this.state === "playing" && this.requsetId === null) {
			this.tick();
		}
	}
}

export class Animation {
	constructor(
		object,
		property,
		start,
		end,
		duration,
		delay,
		timingFunction,
		template
	) {
		this.object = object;
		this.property = property;
		this.start = start;
		this.end = end;
		this.duration = duration;
		this.delay = delay || 0;
		this.timingFunction = timingFunction;
		this.template = template;
	}

	valueFromProgression(progression) {
		return this.start + progression * (this.end - this.start);
	}
}

export class ColorAnimation {
	constructor(
		object,
		property,
		start,
		end,
		duration,
		delay,
		timingFunction,
		template
	) {
		this.object = object;
		this.property = property;
		this.start = start;
		this.end = end;
		this.duration = duration;
		this.delay = delay || 0;
		this.timingFunction = timingFunction;
		this.template = template || ((v) => `rgba(${v.r}, ${v.g}, ${v.b}, ${v.a})`);
	}

	valueFromProgression(progression) {
		return {
			r: this.start.r + progression * (this.end.r - this.start.r),
			g: this.start.g + progression * (this.end.g - this.start.g),
			b: this.start.b + progression * (this.end.b - this.start.b),
			a: this.start.a + progression * (this.end.a - this.start.a),
		};
	}
}