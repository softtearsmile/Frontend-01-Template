import {
  parseHTML
} from "../src/parser";
let assert = require('assert')

it('parse a single element', () => {
  let doc = parseHTML('<div></div>')
  let div = doc.children[0]

  assert.equal(div.tagName, 'div')
  assert.equal(div.children.length, 0)
  assert.equal(div.type, 'element')
  assert.equal(div.attributes.length, 2)
})

it('parse a single element with text content', () => {
  let doc = parseHTML('<div>hello</div>')
  let text = doc.children[0].children[0]

  assert.equal(text.content, 'hello')
  assert.equal(text.type, 'text')
})

it('tag missmatch', () => {
  try {
    let doc = parseHTML('<div></biv>')
  } catch (error) {
    assert.equal(error.message, '标签首尾无法匹配')
  }
})

it('text with <', () => {
  let doc = parseHTML('<div>a < b</div>')
  let text = doc.children[0].children[0]
  assert.equal(text.content, 'a < b')
  assert.equal(text.type, 'text')
})

it('with property', () => {
  let doc = parseHTML("<div  id= a class ='cls' data=\"abc\" ></div>")
  let div = doc.children[0]
  let count = 0
  for (const {
      name,
      value
    } of div.attributes) {
    if (name === 'id') {
      count++
      assert.equal(value, 'a')
    } else if (name === 'class') {
      count++
      assert.equal(value, 'cls')
    } else if (name === 'data') {
      count++
      assert.equal(value, 'abc')
    }
  }
  assert.ok(count === 3)
})

it('with property2', () => {
  let doc = parseHTML("<div  id=a></div>")
  let div = doc.children[0]
  let count = 0
  for (const {
      name,
      value
    } of div.attributes) {
    if (name === 'id') {
      count++
      assert.equal(value, 'a')
    }
  }
  assert.ok(count === 1)
})

it('with property3', () => {
  let doc = parseHTML("<div  id=\"a\"></div>")
  let div = doc.children[0]
  let count = 0
  for (const {
      name,
      value
    } of div.attributes) {
    if (name === 'id') {
      count++
      assert.equal(value, 'a')
    }
  }
  assert.ok(count === 1)
})

it('property error', () => {
  try {
    let doc = parseHTML('<div = ></div>')
  } catch (error) {
    assert.equal(error.message, '解析属性错误')
  }
})

it('tag selfClosing', () => {
  let doc = parseHTML('<div a b c=d/>')
  let div = doc.children[0]
  
  assert.equal(div.tagName, 'div')
  assert.equal(div.children.length, 0)
  assert.equal(div.type, 'element')
  assert.equal(div.attributes.length, 6)
})

it('tag selfClosing2', () => {
  let doc = parseHTML('<img a/>')
  let img = doc.children[0]
  
  assert.equal(img.tagName, 'img')
  assert.equal(img.children.length, 0)
  assert.equal(img.type, 'element')
  assert.equal(img.attributes.length, 3)
})

it('tag selfClosing3', () => {
  let doc = parseHTML('<img a=\'b\'/>')
  let img = doc.children[0]
  
  assert.equal(img.tagName, 'img')
  assert.equal(img.children.length, 0)
  assert.equal(img.type, 'element')
  assert.equal(img.attributes.length, 4)
})


it('br selfClosing', () => {
  let doc = parseHTML('<br/>')
  let br = doc.children[0]
  
  assert.equal(br.tagName, 'br')
  assert.equal(br.children.length, 0)
  assert.equal(br.type, 'element')
  assert.equal(br.attributes.length, 3)
})

it('tag script', () => {
  let doc = parseHTML('<script></script>')
  let script = doc.children[0]
  assert.equal(script.tagName, 'script')
  assert.equal(script.children.length, 0)
  assert.equal(script.type, 'element')
  assert.equal(script.attributes.length, 2)
})

it('tag script with content', () => {
  let doc = parseHTML('<script> <a </a </sa </sca </scra </scria </scripa </script </script>')
  let text = doc.children[0].children[0]
  assert.equal(text.content, ' <a </a </sa </sca </scra </scria </scripa </script ')
  assert.equal(text.type, 'text')
})
