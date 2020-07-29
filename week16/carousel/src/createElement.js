import { enableGesture } from "./gestrue";

export function createElement(Cls, attributes, ...children) {
	// console.log(arguments);
	let o;

	if (typeof Cls === "string") {
		o = new Wrapper(Cls);
	} else {
		o = new Cls();
	}

	for (let name in attributes) {
		o.setAttribute(name, attributes[name]);
	}

	// console.log('children',children);
	let visit = (children) => {
		for (let child of children) {
			if (Array.isArray(child)) {
				visit(child);
				continue;
			}
			if (typeof child === "string") {
				child = new Text(child);
			}

			o.children.push(child);
		}
	};

	visit(children);

	return o;
}

class Text {
	constructor(text) {
		this.root = document.createTextNode(text);
	}

	mountTo(parent) {
		parent.appendChild(this.root);
	}
}

class Wrapper {
	constructor(type) {
		// console.log("config", config);
		this.children = [];
		this.root = document.createElement(type);
	}

	// set class(v) { // property
	//     // console.log("Parent::class", v);
	// }

	setAttribute(name, value) {
		// attribute
		// console.log(name, value);
		this.root.setAttribute(name, value);

		if (name.match(/^on([\s\S]+)$/)) {
			let eventName = RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase());
			this.root.addEventListener(eventName, value);
		}
		if (name === "enableGesture") {
			enableGesture(this.root);
		}
	}

	appendChild(child) {
		this.children.push(child);
	}

	addEventListener(...arg) {
		this.root.addEventListener(...arg);
	}

	get style() {
		return this.root.style;
	}

	mountTo(parent) {
		parent.appendChild(this.root);

		for (let child of this.children) {
			child.mountTo(this.root);
		}
	}
}