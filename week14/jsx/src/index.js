function createElement(Cls, attributes, ...children) {
  let o 

  if(typeof Cls ==='string'){
    o = new Wrapper(Cls)
  }else{
    o = new Cls({
      timer: {}
    })
  }

  for (let name in attributes) {
    o.setAttribute(name, attributes[name])
  }

  for (let child of children) {
    if(typeof child === 'string'){
      child = new Text(child)
    }
    o.appendChild(child)
  }

  return o
}

class MyComponent {
  constructor() {
    this.children = []
  }
  appendChild(child){
    this.children.push(child)
  }
  render(){
    return <article>
        <header>I'm a header</header>
        {this.slot}
        <footer>I'm a footer</footer>
    </article>
  }
  mountTo(parent){
    this.slot = <div></div>
    console.log('render',JSON.stringify(this.render()) );

    for(let child of this.children){
      this.slot.appendChild(child)
    }


    
    this.render().mountTo(parent)
  }
}

class Wrapper {
  constructor(type) {
    this.type = type
    this.root = document.createElement(type)
    this.children = []
  }
  setAttribute(name,value){
    this.root.setAttribute(name,value)
  }
  appendChild(child){
    this.children.push(child)
  }
  mountTo(parent){
    parent.appendChild(this.root)
    for(let child of this.children){
      child.mountTo(this.root)
    }
  }
}

class Text{
  constructor(text) {
    this.root = document.createTextNode(text)
  }
  mountTo(parent){
      parent.appendChild(this.root);
  }
}

let myComponent = <MyComponent  >
  <div id = "a" class = "b" style="width:100px;height:100px;background-color:#ff0000">text啦</div>
  <a>百度</a>
  <div></div>
</MyComponent>

myComponent.mountTo(document.body)
console.log('myComponent',myComponent);

