import { createElement } from "./createElement";
import { Timeline, Animation } from "./animation";
import { ease, linear } from "./cubicBezier";

export class Carousel {
	constructor(config) {
		this.children = [];
	}

	setAttribute(name, value) {
		// attribute
		this[name] = value;
	}

	appendChild(child) {
		this.children.push(child);
	}

	render() {
		let timeline = new Timeline();
		timeline.start();

		let position = 0;

		let nextPicStopHandler = null;
    
		let children = this.data.map((url, currentPosition) => {

			let lastPosition =
				(currentPosition - 1 + this.data.length) % this.data.length;
			let nextPosition = (currentPosition + 1) % this.data.length;

			let offset = 0;

			let onStart = () => {
				timeline.pause();
				if (nextPicStopHandler != null) {
					clearTimeout(nextPicStopHandler);
					nextPicStopHandler = null;
				}

				let currentElement = children[currentPosition];

				let currentTransformValue = Number(
					currentElement.style.transform.match(/-?\d+/)[0]
				);
				offset = currentTransformValue + 500 * currentPosition;
			};

			let onPan = (event) => {
				let lastElement = children[lastPosition];
				let currentElement = children[currentPosition];
				let nextElement = children[nextPosition];

				const { clientX, startX } = event.detail;
				const dx = clientX - startX;

				let lastTransformValue = -500 - 500 * lastPosition + offset + dx;
				let currentTransformValue = -500 * currentPosition + offset + dx;
				let nextTransformValue = 500 - 500 * nextPosition + offset + dx;

				lastElement.style.transform = `translateX(${lastTransformValue}px)`;
				currentElement.style.transform = `translateX(${currentTransformValue}px)`;
				nextElement.style.transform = `translateX(${nextTransformValue}px)`;
			};

			let onPanend = (event) => {
				let lastElement = children[lastPosition];
				let currentElement = children[currentPosition];
				let nextElement = children[nextPosition];

				const { clientX, startX, isFlick, speed } = event.detail;
				const dx = clientX - startX;
				// console.log("dx", dx);
				// console.log("offset", offset);
				// console.log("isFlick", isFlick);
				// console.log("speed", speed);

				let lastTransformValue = -500 - 500 * lastPosition + offset + dx;
				let currentTransformValue = -500 * currentPosition + offset + dx;
				let nextTransformValue = 500 - 500 * nextPosition + offset + dx;

				let direction = 0;

				if (isFlick) {
					direction = dx > 0 ? 1 : -1;
				} else {
					if (dx + offset > 250) {
						direction = 1;
					} else if (dx + offset < -250) {
						direction = -1;
					}
				}

				timeline.reset();
				timeline.start();

				let lastAnimation = new Animation(
					lastElement.style,
					"transform",
					lastTransformValue,
					direction * 500 - 500 - 500 * lastPosition,
					500,
					0,
					ease,
					(v) => `translateX(${v}px)`
				);

				let currentAnimation = new Animation(
					currentElement.style,
					"transform",
					currentTransformValue,
					direction * 500 - 500 * currentPosition,
					500,
					0,
					ease,
					(v) => `translateX(${v}px)`
				);

				let nextAnimation = new Animation(
					nextElement.style,
					"transform",
					nextTransformValue,
					direction * 500 + 500 - 500 * nextPosition,
					500,
					0,
					ease,
					(v) => `translateX(${v}px)`
				);

				timeline.add(lastAnimation);
				timeline.add(currentAnimation);
				timeline.add(nextAnimation);

				position = (position - direction + this.data.length) % this.data.length;
				// console.log("position", position);
				nextPicStopHandler = setTimeout(nextPic, 2000);
			};

			let element = 
				<img
					src={url}
					enableGesture={true}
					onStart={onStart}
					onPan={onPan}
					onPanend={onPanend}
					onTap={() => {
						// 如果tap时不需要进行链接跳转，可以加一段逻辑使动画继续
						timeline.resume();
						if (nextPicStopHandler == null) {
							nextPicStopHandler = setTimeout(nextPic, 2000);
						}
					}}
				/>
			element.style.transform = "translateX(0px)";
      element.addEventListener("dragstart", (event) => event.preventDefault());
			return element;
    });
    

    let root = <div class="carousel">{children}</div>;
    
    console.log('root',root);


		let nextPic = () => {
			let nextPosition = (position + 1) % this.data.length;

			let current = children[position];
			let next = children[nextPosition];

			let currentAnimation = new Animation(
				current.style,
				"transform",
				-500 * position,
				-500 - 500 * position,
				500,
				0,
				ease,
				(v) => `translateX(${v}px)`
			);

			let nextAnimation = new Animation(
				next.style,
				"transform",
				500 - 500 * nextPosition,
				-500 * nextPosition,
				500,
				0,
				ease,
				(v) => `translateX(${v}px)`
			);

			timeline.add(currentAnimation);
			timeline.add(nextAnimation);

			position = nextPosition;
			nextPicStopHandler = setTimeout(nextPic, 2000);
		};

		nextPicStopHandler = setTimeout(nextPic, 2000);

		return root;
	}

	mountTo(parent) {
		this.render().mountTo(parent);
	}
}