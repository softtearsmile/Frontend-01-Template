function createElement (Cls, attributes, ...children) {
  // console.log(arguments);
  let o;
  
  if (typeof Cls === 'string') {
      o = new Wrapper(Cls);
  } else {
      o = new Cls({
          timer: null
      });
  }

  for (let name in attributes) {
      o.setAttribute(name, attributes[name]);
  }

  console.log('children',children);
  let visit = (children) => {
      for (let child of children) {
          
          if (child instanceof Array) {
              visit(child);
              continue;
          }

          if (typeof child === 'string') {
              child = new Text(child);
          }

          o.appendChild(child);
      }
  }
  
  visit(children);

  return o;
}

class Wrapper {
  constructor (type) {
      this.children = [];
      this.root = document.createElement(type);
  }

  setAttribute (name, value) {
      this.root.setAttribute(name, value);
  }

  appendChild (child) {
      this.children.push(child);
  }

  addEventListener () {
      this.root.addEventListener(...arguments);
  }

  get style () {
      return this.root.style;
  }

  mountTo (parent) {
      parent.appendChild(this.root);
      for (let child of this.children) {
          if (typeof child === 'string') {
              child = new Text(child);
          }
          child.mountTo(this.root);
      }
  }
}

class Text {
  constructor (text) {
      this.root = document.createTextNode(text);
  }

  mountTo (parent) {
      parent.appendChild(this.root);
  }
}


module.exports={
  createElement,
  Wrapper,
  Text,
}