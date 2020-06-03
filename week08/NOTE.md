# 每周总结可以写在这里

# 作业

```js
function match(selector, element) {
  let e = selector.split(" ").pop(); //清除符号间的空格
  let match = e.match(/( |\+|~|>)(.+)$/); //筛选一遍复杂选择器
  e = match ? match[2] : e;
  match = e.match(/(.+)(:hover|::before|::after)$/); //剔除伪类和伪元素
  e = match ? match[1] : e;
  match = e.match(/#(.+?)(\.|\[)/); //获取id
  const id = match ? match[1] : match;
  match = e.match(/\.(.+?)(#|\[)/); //获取class
  const classname = match ? match[1].split(".") : match;
  console.log(classname);

  //判定id
  if (id && element.getAttribute("id") === id) return true;

  //判定classname
  if (classname) {
    classname.push(element.getAttribute("class").split(" "));
    const newclassname = Array.from(classname);
    if (classname.length !== newclassname.length) return true;
  }

  return false;
}

match("div > a#id.class.abc:hover");
```

## 选择器

### 选择器语法

- 简单选择器
  - - (全体)
  - div svg|a (标签)
  - .cls (类)
  - #id (id)
  - [attr=value](属性)
  - :hover (伪类)
  - ::before (伪元素)
- 复合选择器
  - <简单> <简单> <简单>
  - - 和 div 在最前面
- 复杂选择器
  - 后代：<复合><space><复合> (css2)
  - 子元素：<复合>'>'<复合> (css3)
  - 兄弟：<复合>'~'<复合> (选择该选择器之后的兄弟元素，css3)
  - 亲兄弟：<复合>'+'<复合> (只有一个，css3)
  - <复合>'||'<复合> (css4)

### 选择器优先级

```
//练习
div#a.b .c[id=x] 0131 属性选择器和类选择器同级
#a:not(#b) 0200 not不算进优先级
*.a 0010 *不算进优先级
div.a 0011
```

### 伪类

- 链接/行为
  - :any-link(表示所有超链接相关)
  - :link(没访问过的) :visited(访问过的)
  - :hover(鼠标移入元素)
  - :active(针对有交互的元素)
  - :focus
  - :target(比较新的浏览器才有)
- 树结构
  - :empty
  - :nth-child()
  - :nth-last-child()
  - :first-child :last-child :only-child
- 逻辑型
  - :not 伪类
  - :where :has (css4 标准，大概率不会实现)

### 伪元素

不一定非得双:

- ::before
- ::after
- ::first-line 都是文字上的属性，非盒上的，需要在 layout 之后再计算这部分的 css
  - font
  - color
  - background
  - word-spacing
  - letter-spacing
  - text-decoration
  - text-transform
  - line-height
- ::first-letter
  - ...同上
  - float
  - vertical-align
  - 盒模型系列：margin,padding,border

#### 思考：

为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？

first-line 如果是指 float 就脱离文档流就不是正常流的 first-line ，会造成死循环

## 排版

### 盒

- 标签：html 里面写的<>
- 元素：心里面知道的语义
- 盒：网页中看到四方块
  - 盒模型
    - border-box：内容+内边距 = 宽高
    - content-box：内容 = 宽高
