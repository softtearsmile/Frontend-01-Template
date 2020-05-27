function getStyle(element) {
  if (!element.style) element.style = {};

  for (let prop in element.computedStyle) {
    // console.log(prop);

    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop], 10);
    }
    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop], 10);
    }
  }

  return element.style;
}

function layout(element) {
  if (!element.computedStyle) return;

  const elementStyle = getStyle(element);

  //不是弹性布局则弹出
  if (elementStyle.display !== "flex") return;

  const items = element.children.filter((e) => e.type === "element");
  let items_length = items.length;

  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  const style = elementStyle;

  [("width", "height")].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  // 设置默认值
  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.alignItems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "nowrap";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.alignContent = "stretch";
  }
  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;

  switch (style.flexDirection) {
    case "row":
      mainSize = "width";
      mainStart = "left";
      mainEnd = "right";
      mainSign = +1;
      mainBase = 0;

      crossSize = "height";
      crossStart = "top";
      crossEnd = "bottom";
      break;
    case "row-reverse":
      mainSize = "width";
      mainStart = "right";
      mainEnd = "left";
      mainSign = -1;
      mainBase = style.width;

      crossSize = "height";
      crossStart = "top";
      crossEnd = "bottom";
      break;
    case "column":
      mainSize = "height";
      mainStart = "top";
      mainEnd = "bottom";
      mainSign = +1;
      mainBase = 0;

      crossSize = "width";
      crossStart = "right";
      crossEnd = "left";
      break;
    case "column-reverse":
      mainSize = "height";
      mainStart = "top";
      mainEnd = "bottom";
      mainSign = -1;
      mainBase = style.height;

      crossSize = "width";
      crossStart = "right";
      crossEnd = "left";
      break;

    default:
      break;
  }

  if (style.flexWrap === "wrap-reverse") {
    crossStart = crossStart ^ crossEnd;
    crossEnd = crossStart ^ crossEnd;
    crossStart = crossStart ^ crossEnd;

    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  let isAutoMainSize = false;

  if (!style[mainSize]) {
    style[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== void 0) {
        style[mainSize] += itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  let flexLine = [];
  let flexLines = [flexLine];

  let mainSpace = style[mainSize];
  let crossSpace = 0;

  for (let i = 0; i < items_length; i++) {
    let item = items[i];
    let itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0;

    if (itemStyle.flex) {
      flexLine.push(itemStyle);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null || itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }

      flexLine.push(itemStyle);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;

        flexLine = [item];
        flexLines.push(flexLine);

        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }

      if (itemStyle[crossSize] !== null || itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }

  flexLine.mainSpace = mainSpace;

  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    let scale = style[mainSize] / (style[mainSize] - mainSpace);
    let currentMain = mainBase;
    for (let i = 0; i < items_length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] *= scale;
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];

      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach((items) => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;

      for (let i = 0; i < items_length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        let currentMain = mainBase;
        for (let i = 0; i < items_length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];

          currentMain = itemStyle[mainEnd];
        }
      } else {
        let currentMain, step;
        switch (style.justifyContent) {
          case "flex-start":
            currentMain = mainBase;
            step = 0;
            break;
          case "flex-end":
            currentMain = mainSpace * mainSign + mainBase;
            step = 0;
            break;
          case "center":
            currentMain = (v / 2) * mainSign + mainBase;
            step = 0;
            break;
          case "space-between":
            currentMain = mainBase;
            step = (mainSpace / (items_length - 1)) * mainSign;
            break;
          case "space-around":
            step = (mainSpace / items_length) * mainSign;
            currentMain = step / 2 + mainBase;
            break;

          default:
            break;
        }
      }
    });
  }

  if (!style[crossSize]) {
    crossSpace = 0;
    style[crossSize] = 0;
    flexLines.forEach((flexLine) => {
      style[crossSize] += flexLine.crossSpace;
    });
  } else {
    crossSpace = style[crossSize];
    flexLines.forEach((flexLine) => {
      crossSpace -= flexLine.crossSpace;
    });
  }

  crossSpace = style.flexWrap === "wrap-reverse" ? style[crossSize] : 0;

  let lineSize = style[crossSize] / flexLines.length;
  let step;

  switch (style.alignContent) {
    case "flex-start":
      crossBase += 0;
      step = 0;
      break;
    case "flex-end":
      crossBase += crossSign * crossSpace;
      step = 0;
      break;
    case "center":
      crossBase += (crossSign * crossSpace) / 2;
      step = 0;
      break;
    case "space-between":
      crossBase += 0;
      step = crossSpace / (items_length - 1);
      break;
    case "space-around":
      step = crossSpace / items_length;
      crossBase = (step / 2) * crossSign;
      break;
    case "stretch":
      crossBase += 0;
      step = 0;
      break;
    default:
      break;
  }

  flexLines.forEach((items) => {
    let lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;

    items.forEach((item) => {
      let itemStyle = getStyle(item);

      let align = itemStyle.alignSelf || style.alignItems;

      if (!itemStyle[crossSize] === null) {
        itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }

      switch (align) {
        case "flex-start":
          itemStyle[crossStart] = crossBase;
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize];

          break;
        case "flex-end":
          itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
          itemStyle[crossStart] =
            itemStyle[crossEnd] - crossSign * itemStyle[crossSize];

          break;
        case "center":
          itemStyle[crossStart] =
            crossBase +
            (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize];

          break;
        case "stretch":
          itemStyle[crossStart] = crossBase;
          itemStyle[crossEnd] =
            crossBase +
            crossSign *
              (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
              ? itemStyle[crossSize]
              : lineCrossSize;

          itemStyle[crossSize] =
            crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);

          break;

        default:
          break;
      }

      crossBase += crossSign * (lineCrossSize + step);
    });
  });

  console.log(items);
}

module.exports = layout;
