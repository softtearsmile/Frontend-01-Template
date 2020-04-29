# 每周总结可以写在这里

[toc]

# 表达式，类型转换

## 表达式(Expression)

### member

[运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

+ a.b
+ a[b]
+ foo\`string\`(函数传参)
    + [ \`str${ , 参数 , } str \`]
+ super.b：调用父类的属性
+ super[\`b\`]
+ new.target(少见)：只能在构造函数运行时可得，用于判断一个对象是不是某个构造函数 new 出来的
+ new Foo() > new Foo 
    + new a()()
    + new new a() === new (new a())

### call

+ foo()
+ super()
+ foo()['b']
+ foo().b
+ foo()\`abc\`

## Left Handside && Right Handside

### update

+ a++
+ a--
+ --a
+ ++a


# JavaScript | 语句，对象

## 语句(Grammer)

### 简单语句

+ ExpressionStatement
+ EmptyStatement
+ DebuggerStatement
+ ThrowStatement
+ ContinueStatement
+ BreakStatement
+ ReturnStatement

### 复合语句

+ **BlockStatement**：代码块{}
+ IfStatement
+ SwitchStatement
+ IterationStatement
    + while(){}
    + do{}while()
    + for( ; ; ){}
    + for( in ){}
    + for( of ){}
+ WithStatement
+ LabelledStatement
+ TryStatement

## 运行时(Runtime)

### Completion Record

+ [[type]]:normal, break, continue, return, or throw
+ [[value]]:Types
+ [[target]]:label

## 声明(Declaration)

+ FunctionDeclaration
+ GeneratorDeclaration
+ AsyncFunctionDeclaration
+ AsyncGeneratorDeclaration
+ VariableStatement
+ ClassDeclaration
+ LexicalDeclaration

### 预处理（pre-process）

+ js在正式执行前会对代码进行预处理
+ 会在全局作用域抓取 var 和 function 声明
+ var 肯定是 undefined ，而 function 是本身
+ 同名 function 优先级 高于 var
+ 当执行一个函数时，同样会先函数作用域进行预处理

## 对象

+ 对象都有唯一性
+ 用状态描述对象
+ 用行为改变状态

### 原型




# 作业

## convertStringToNumber和convertNumberToString

```js

function converStringToNumber(str, x = 10) {
  if (typeof str !== "string") return;
  let chars = str.split("");
  let len = chars.length;
  let number = 0;
  let i = 0;
  //整数
  while (i < len) {
    if (chars[i] === ".") {
      i++;
      break;
    }
    let num = checkString(chars[i]);
    if (num > -1 && num < x) {
      number *= x;
      number += num;
      i++;
    } else {
      break;
    }
  }

  //小数
  let fraction = 1;
  while (i < len) {
    let num = checkString(chars[i]);
    if (num > -1 && num < x) {
      fraction /= x;
      number += num * fraction;
      i++;
    } else {
      break;
    }
  }

  return number;

  //检测
  function checkString(str) {
    let code = str.charCodeAt();
    if (code >= "0".charCodeAt() && code <= "9".charCodeAt()) {
      return code - "0".charCodeAt();
    } else if (code >= "a".charCodeAt() && code <= "e".charCodeAt()) {
      return code - "a".charCodeAt() + 10;
    } else if (code >= "A".charCodeAt() && code <= "E".charCodeAt()) {
      return code - "A".charCodeAt() + 10;
    } else {
      return;
    }
  }
}

function converNumberToString(number, x = 10) {
  let integer = Math.floor(number);
  let fraction = number - integer;
  let string = "";
  //整数
  while (integer > 0) {
    let code = integer % x;
    string = code > 10 ? String.fromCharCode(code + 55) : code + string;
    integer = Math.floor(integer / x);
  }

  //小数
  if (fraction) {
    string += ".";
    let i = 0;
    while (fraction > 0 && i < 8) {
      fraction = fraction * x;
      let code = Math.floor(fraction);
      string += code > 10 ? String.fromCharCode(code + 55) : code;
      fraction = fraction - code;
      i++;
    }
  }

  return string;
}
```

## JavaScript 标准里有哪些对象是我们无法实现出来的，有哪些特性？

### ParameterMap 

+ 只能使用 Object.prototype.toString 去确定参数
+ 


### CreateUnmappedArgumentsObject

+ 设置 obj.[[ParameterMap]] to undefined.

