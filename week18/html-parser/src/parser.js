const EOF = Symbol("EOF"); //EOF: End Of File 用于结束的标志，只要是唯一的就可以
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{
  type: "document",
  children: []
}];

function emit(token) {
  let top = stack[stack.length - 1];
  if (token.type === "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: [],
    };
    element.tagName = token.tagName;

    for (let p in token) {
      if (p !== "type" || p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }

    top.children.push(element);
    element.parent = top;

    if (token.isSelfClosing) {
      //自封闭节点不入栈
    } else {
      stack.push(element);
    }

    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName === token.tagName) {
      //当遇到css时执行css
      if (top.tagName === "style") {
        // addCSSRules(top.children[0].content);
      }
      // layout(top); //排版布局
      stack.pop();
    } else {
      throw new Error("标签首尾无法匹配");
    }
    currentTextNode = null;
  } else if (token.type === "text") {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: "",
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c === "<") {
    return tagOpen;
  } else if (c === EOF) {
    emit({
      type: "EOF",
    });
    return stack;
  } else {
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c === "/") {
    // </  例：</br>
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else {
    emit({
      type: 'text',
      content: `<${c}`
    })
    return data;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagName(c);
  } else if (c === ">") {
    return data;
  } else if (c === EOF) {} else {}
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    //空格
    return beforeAttributeName;
  } else if (c === "/") {
    //<br/>
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === ">") {
    emit(currentToken);
    return data;
  } else {
    currentToken.tagName += c;
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    //空格
    return beforeAttributeName;
  } else if (c === "/" || c === ">" || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "=") {
    //报错
    throw new Error("解析属性错误");
  } else {
    currentAttribute = {
      name: "",
      value: "",
    };
    return attributeName(c);
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken);
    return data;
  } else if (c === EOF) {} else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: "",
      value: "",
    };
    return attributeName(c);
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === "\u0000") {
    console.error("解析属性名称错误");
  } else if (c === '"' || c === "'" || c === "<") {
    console.error("解析属性名称错误");
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    return beforeAttributeValue;
  } else if (c === '\"') {
    return doubleQuotedAttributeValue;
  } else if (c === "\'") {
    return singleQuotedAttributeValue;
  } else if (c === ">") {
    return data
  } else {
    return UnQuotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === "\"") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {} else if (c === EOF) {} else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "\'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {} else if (c === EOF) {} else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function UnQuotedAttributeValue(c) {  
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === "\u0000" || c===EOF) {
    console.error("解析无引号属性值错误");
  } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {
    console.error("解析无引号属性值错误");
  } else {
    currentAttribute.value += c;
    return UnQuotedAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken);
    return data;
  } else if (c === EOF) {} else {
    currentAttribute.value +=c
    return doubleQuotedAttributeValue(c);
  }
}

function selfClosingStartTag(c) {
  if (c === ">") {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c === "EOF") {} else {}
}

//in script
function scriptData(c) {

  if (c == "<") {
    return scriptDataLessThanSign;
  } else {
    emit({
      type: "text",
      content: c
    });
    return scriptData;
  }
}
//in script received <
function scriptDataLessThanSign(c) {
  if (c == "/") {
    return scriptDataEndTagOpen;
  } else {
    emit({
      type: "text",
      content: "<"+c
    });
    return scriptData;
  }
}
//in script received </
function scriptDataEndTagOpen(c) {
  if (c == "s") {
    return scriptDataEndTagNameS;
  } else {
    emit({
      type: "text",
      content: "</"+c
    });
    return scriptData;
  }
}
//in script received </s
function scriptDataEndTagNameS(c) {
  if (c == "c") {
    return scriptDataEndTagNameC;
  } else {
    emit({
      type: "text",
      content: "</s"+c
    });
    return scriptData;
  }
}

//in script received </sc
function scriptDataEndTagNameC(c) {
  if (c == "r") {
    return scriptDataEndTagNameR;
  } else {
    emit({
      type: "text",
      content: "</sc"+c
    });
    return scriptData;
  }
}

//in script received </scr
function scriptDataEndTagNameR(c) {
  if (c == "i") {
    return scriptDataEndTagNameI;
  } else {
    emit({
      type: "text",
      content: "</scr"+c
    });
    return scriptData;
  }
}
//in script received </scri
function scriptDataEndTagNameI(c) {
  if (c == "p") {
    return scriptDataEndTagNameP;
  } else {
    emit({
      type: "text",
      content: "</scri"+c
    });
    return scriptData;
  }
}
//in script received </scrip
function scriptDataEndTagNameP(c) {
  if (c == "t") {
    return scriptDataEndTag;
  } else {
    emit({
      type: "text",
      content: "</scrip"+c
    });
    return scriptData;
  }
}
//in script received </script
function scriptDataEndTag(c) {
  if (c == ">") {
    emit({
      type: "endTag",
      tagName: "script"
    });
    return data;
  } else {
    emit({
      type: "text",
      content: "</script"+c
    });
    return scriptData;
  }
}


export function parseHTML(html) {
  let state = data;
  stack = [{
    type: "document",
    children: []
  }];
  for (let c of html) {
    state = state(c);
    // state === data 意味着script文本完结
    if (stack[stack.length - 1].tagName === "script" && state === data) {
      state = scriptData;
    }
  }
  state = state(EOF);

  return state[0];
};