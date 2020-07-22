const parser = require('./parser')

module.exports = function (source, map) {
  console.log(source)
  console.log('----------------my loader start -------------------->')
  const tree = parser.parseHTML(source)
  let template = null;
  let script = null;
  for (let node of tree.children) {
    if (node.tagName === 'template') {
      template = node.children.filter(v => v.type !== 'text')[0];
    }
    if (node.tagName === 'script') {
      script = node.children[0].content;
    }
  }

  const visit = (node) => {
    console.log(node)
    if (node.type === 'text') {
      return JSON.stringify(node.content);
    }
    let attrs = {};
    for (let attr of node.attributes) {
      if (!['type', 'tagName', 'isSelfClosing'].includes(attr.name)) {
        attrs[attr.name] = attr.value;
      }
    }
    let children = node.children.map(node => visit(node))
    return `createElement("${node.tagName}", ${JSON.stringify(attrs)}, ${children})`
  }
  const r = `
import {createElement,Wrapper,Text} from './createElement'
export class Carousel {
  constructor(){
    this.children = [];
    this.root = document.createElement('div')
  }
  setAttribute(name, val) {
    console.log(name, val)
    this.root.setAttribute(name, val)
  }
  mountTo(parent){
    this.render().mountTo(parent);
  }
  render() {
    return ${visit(template)}
  }
}
`
  console.log(r)
  console.log('----------------my loader end -------------------->')
  return r;
}