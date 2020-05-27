const css = require("css");
const rules = [];

function addCSSRules(text) {
  let ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function computeCSS(element, stack) {
  const elements = stack.slice().reverse();

  if (!element.computedStyle) element.computedStyle = {};

  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(" ").reverse();

    if (!match(element, selectorParts[0])) continue;

    let j = 1,
      matched = false;
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) j++;
    }

    if (j >= selectorParts.length) matched = true;
    if (matched) {
      let sp = specificity(rule.selectors[0]);
      //如果匹配到，就加入
      let computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        } else if (
          compare(computedStyle[declaration.property].specificity, sp) < 0
        ) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}

function match(element, selector) {
  if (!selector || !element.attributes) return false;
  // div.class#id[attr=value]
  if (selector.charAt(0) === "#") {
    let attr = element.attributes.filter((attr) => attr.name === "id")[0];
    if (attr && attr.value === selector.replace("#", "")) return true;
  } else if (selector.charAt(0) === ".") {
    let attr = element.attributes.filter((attr) => attr.name === "class")[0];
    if (attr && attr.value === selector.replace(".", "")) return true;
  } else {
    if (element.tagName === selector) return true;
  }
}

function specificity(selector) {
  const p = [0, 0, 0, 0];
  const selectorParts = selector.split(" ");

  for (let part of selectorParts) {
    if (part.charAt(0) === "#") {
      p[1] += 1;
    } else if (part.charAt(0) === ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  } else if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  } else if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

module.exports.addCSSRules = addCSSRules;
module.exports.computeCSS = computeCSS;
