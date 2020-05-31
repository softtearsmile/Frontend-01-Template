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

  const style = getStyle(element);

  //不是弹性布局则弹出
  if (style.display !== "flex") return;

  //取出主元素下的子元素
  const items = element.children.filter((e) => e.type === "element");
  let items_length = items.length;

  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  // const style = elementStyle;

  //给主元素宽高打上null方便后面计算
  ["width", "height"].forEach((size) => {
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

  // console.log(items);

  //主元素无设主轴的长度则是子元素累加
  let isAutoMainSize = false;
  if (!style[mainSize]) {
    style[mainSize] = 0;
    items.forEach((item) => {
      const itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== void 0) {
        style[mainSize] += itemStyle[mainSize];
      }
    });

    isAutoMainSize = true;
  }

  // 第二步：元素分行

  let flexLine = []; //表示一行
  const flexLines = [flexLine]; //表示所有行

  //剩余空间
  let mainSpace = style[mainSize];
  let crossSpace = 0;
  items.forEach((item) => {
    const itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0;

    if (itemStyle.flex) {
      //有flex的元素，即可伸缩
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null || itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]); //cross为子元素 crossSize最大值
      }

      flexLine.push(itemStyle);
    } else {
      //如果子元素比父元素还大，则限制
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      //如果剩余空间不够容纳不了当前子元素
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;

        flexLine = [item]; //另起一行
        flexLines.push(flexLine);

        //重置剩余空间
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
  });

  flexLine.mainSpace = mainSpace;

  // console.log(items);

  // 第三步：计算主轴

  //主轴不换行
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    //单行需要压缩子元素情况
    let scale = style[mainSize] / (style[mainSize] - mainSpace); // scale < 1
    let currentMain = mainBase;
    items.forEach((item) => {
      let itemStyle = getStyle(item);

      if (itemStyle.flex) itemStyle[mainSize] = 0; //flex元素先置0

      itemStyle[mainSize] *= scale;

      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];

      currentMain = itemStyle[mainEnd];
    });
  } else {
    //有剩余空间
    flexLines.forEach((flexLine) => {
      let mainSpace = flexLine.mainSpace;
      let flexTotal = 0; //flex总值
      //找flex总值
      flexLine.forEach((item) => {
        const itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
        }
      });

      if (flexTotal > 0) {
        //有flex的子元素
        let currentMain = mainBase;
        flexLine.forEach((item) => {
          const itemStyle = getStyle(item);

          if (itemStyle.flex) {
            itemStyle[mainSize] = mainSpace * (itemStyle.flex / flexTotal);
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];

          currentMain = itemStyle[mainEnd];
        });
      } else {
        //有剩余空间，但没有flex元素，justifyContent 开始工作
        let currentMain, step; //step额外空间
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
            currentMain = (mainSpace / 2) * mainSign + mainBase;
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
        flexLine.forEach((item) => {
          const itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];

          currentMain = itemStyle[mainEnd] + step;
        });
      }
    });
  }
  // console.log(items);
  // 第四步：计算交叉轴
  // 主要考虑 align-items和align-self

  if (!style[crossSize]) {
    //主元素在交叉轴上是 auto
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

  //若wrap-reverse 交叉轴方向反转
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

  flexLines.forEach((flexLine) => {
    let lineCrossSize =
      style.alignContent === "stretch"
        ? flexLine.crossSpace + crossSpace / flexLines.length
        : flexLine.crossSpace;

    flexLine.forEach((item) => {
      const itemStyle = getStyle(item);

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
              : lineSize;

          itemStyle[crossSize] =
            crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);

          break;

        default:
          break;
      }
    });
    crossBase += crossSign * (lineCrossSize + step);
  });

  console.log(items);
}

module.exports = layout;
