# 每周总结可以写在这里
[toc]
# 编程语言通识与JavaScript语言设计

## 语言按语法分类

+ 非形式语言
    + 中文、英文
+ 形式语言(乔姆斯基谱系)
    + 0 型 无限制文法： <a>左边有多个 ::= "c" 
    + 1 型 上下文相关文法："a"<b>"c"::="a""x""c"
    + 2 型 上下文无关文法：js, 大部分情况是上下文无关
    + 3 型 正则文法

### 产生式(BNF)

+ 用尖括号括起来的名称来标识语法结构名
+ 语法结构分成基础结构和需要用其他语法结构定义的复合结构
    + 基础结构称终结符
    + 复合结构称非终结符
+ 引号和中间的字符表示终结符
+ 可以有括号
+ * 表示重复多次
+ | 表示或
+ + 表示至少一次
+ 四则运算：1 + 2 * 3
+ 终结符：Number、+ - * /
+ 非终结符：MultiplicativeExpression、AddtiveExpression

### 通过产生式理解乔姆斯基谱系

+ 0型 无限制文法：?::=?
+ 1型 上下文相关文法：?<A>?::=?<B>?
+ 2型 上下文无关文法：<A>::=?
+ 3型 正则文法：<A>::=<A>?、<A>::=?<A>(错误) 

### 图灵完备性

+ 命令式---图灵机
    + goto
    + if和while
+ 声明式---lambda
    + 递归

### 类型系统

+ 动静类型
    + 动：代码实际运行时
    + 静：代码编辑时
+ 强弱类型
    + 强：无隐式转换
    + 弱：有隐式转换
+ 复合类型
    + 结构体：{a:T1;b:T2}
    + 函数签名：(T1,T2)=>T3
+ 子类型
    + 逆变：Array<Child> => Array<Parent>
    + 协变：Array<Parent> => Array<Child>


##### 练习

```
<Number> = '0' | '1' ... | '9'

<DecimalNumber> = '0' | ( ( '1' | ... | '9' ) <Number>* )

<PrimaryExpression> = <DecimalNumber> | "(" <LogicalExpression> ")"

<MultiplicativeExpression> = <PrimaryExpression> | 
<MultiplicativeExpression> '*' <PrimaryExpression> | 
<MultiplicativeExpression> '/' <PrimaryExpression>

<AdditiveExpression> = <MultiplicativeExpression> | 
<AdditiveExpression> '+' <MultiplicativeExpression> | 
<MultiplicativeExpression> '-' <AdditiveExpression> 

<LogicalExpression> = <AdditiveExpression> | 
<LogicalExpression> '||' <AdditiveExpression> | 
<LogicalExpression> '&&' <AdditiveExpression>

```

# 词法，类型

## [unicode](https://www.fileformat.info/info/unicode/index.htm)：字符集

+ Blocks 编码组
    + U+0000 ~ U+007F：常用拉丁字符
    + U+4E00 ~ U+9FFF：CJK Unified Ideographs(中日韩)
        + Extension：在5位
    + U+0000 - U+FFFF：BMP基本面(兼容性比较好)
+ [Categories](https://www.fileformat.info/info/unicode/category/index.htm)
    + [Separator, Space ](https://www.fileformat.info/info/unicode/category/Zs/list.htm)  

## Atom 词(脑图Lex部分)

# 作业

```js
//正则表达式 匹配所有 Number 直接量
function get_number(){
    let DecimalLiteral = "0|[1-9][0-9]+\.[0-9]+e|E\-|\+[0-9]+|
    \.[0-9]+e|E\-|\+[0-9]+|
    0|[1-9][0-9]+e|E\-|\+[0-9]+"

    let BinaryIntegerLiteral = "0b|B[0-1]+"

    let OctalIntegerLiteral = "0o|O[0-1]+"

    let HexIntegerLiteral = "0x|X[0-1]+"

    let str = `${DecimalLiteral}|${BinaryIntegerLiteral}|${OctalIntegerLiteral}|${HexIntegerLiteral}`
    return new RegExp(str)
}

//UTF-8 Encoding 的函数
function UTF8_Encoding(str){
    let BinaryInteger = str.codePointAt().toString(2)
    let HexInteger = str.codePointAt().toString(16)
    if(HexInteger<0x0080){
        return `0${BinaryInteger}` 
    }else if(HexInteger>0x007F && HexInteger<0x0800){
        return `110${BinaryInteger.slice(0,5)} 10${BinaryInteger.slice(5,11)}` 
    }else if(HexInteger>0x07FF && HexInteger<0x10000){
        return `1110${BinaryInteger.slice(0,4)} 10${BinaryInteger.slice(4,10) 10${BinaryInteger.slice(10,16)}` 
    }else if(HexInteger>0xFFFF && HexInteger<0x110000){
        return `11110${BinaryInteger.slice(0,3)} 10${BinaryInteger.slice(3,9)} 10${BinaryInteger.slice(9,15)} 10${BinaryInteger.slice(15,21)}` 
    }
}

//匹配所有的字符串直接量，单引号和双引号
function get_string(){
    let str = `${"[U+0000-U+10FFFF^\"]|\\|\\'|\\"|\\b|\\f|\\n|\\r|\\t|\\v|\\x|\\u"}|${'[U+0000-U+10FFFF^\"]|\\|\\'|\\"|\\b|\\f|\\n|\\r|\\t|\\v|\\x|\\u'}`
    return new RegExp(str)
}
```