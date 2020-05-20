/**
 * 字符串匹配
 * @param {String} pattern 模版字符串
 * @param {String} string 主字符串
 * @returns {Boolean} 模版字符串是否在主字符串中
 */
function match(pattern, string) {
  const obj_state = {}; //用于存放状态机的对象
  const m = pattern.length; //模版字符串的长度
  const n = string.length; //主字符串的长度

  obj_state.state = getState(pattern, m, obj_state); //时间复杂度为O(m)

  //时间复杂度为O(n)
  for (let c of string) {
    obj_state.state = obj_state.state(c);
  }

  //合计时间复杂度为 O(m+n)
  return obj_state.state === obj_state.end;
}

//测试用例
console.log(match("abcabx", "abcabcabx"));
console.log(match("abababx", "abababababz"));
console.log(match("ababacd", "ababaeababacd"));

/**
 * 封装状态机
 * @param {String} pattern 模版字符串
 * @param {String} m 模版字符串长度
 * @param {String} obj_state 用于存放状态机的对象
 * @returns {Function} 首个状态机的函数start
 */
function getState(pattern, m, obj_state) {
  const next = getNexts(pattern, m); //获取失效数组
  const state_arr = next.map((v, i) => `found${i}`); //状态机字符串数组
  state_arr.splice(m - 1, 1, "end");

  //状态机的封装
  obj_state.start = function (c) {
    if (c === pattern[0]) {
      return obj_state.found0;
    } else {
      return obj_state.start;
    }
  };

  obj_state.end = function (c) {
    return obj_state.end;
  };

  //时间复杂度为O(m)
  for (let i = 0; i < m - 1; i++) {
    const back = next[i] !== -1 ? state_arr[next[i]] : `start`;
    obj_state[state_arr[i]] = function (c) {
      if (c === pattern[i + 1]) {
        //......逻辑处理
        return obj_state[state_arr[i + 1]];
      } else {
        return obj_state[back](c);
      }
    };
  }
  return obj_state.start;
}

/**
 * 失效函数
 * @param {String} p 模版字符串
 * @param {String} m 模版字符串长度
 * @returns {Array} 失效数组
 */
function getNexts(p, m) {
  const next = new Array(m);
  next[0] = -1;
  let i = 1,
    k = -1;
  while (i < m) {
    while (k !== -1 && p[k + 1] !== p[i]) {
      k = next[k];
    }
    if (p[k + 1] === p[i]) {
      k++;
    }
    next[i] = k;
    i++;
  }
  return next;
}

/**
 * KMP算法(展示，并没有用到)
 * @param {pattern} p 模版字符串
 * @param {String} m 主字符串
 * @returns {Number} 匹配的模版字符串的首位在主字符串的下标
 */
function kmp(pattern, string) {
  const m = pattern.length; //模版字符串的长度
  const n = string.length; //主字符串的长度
  const next = getNexts(pattern, m);
  let i = 0,
    j = 0;
  while (i < n) {
    while (j > 0 && pattern[j] !== string[i]) {
      console.log(i, j);
      j = next[j - 1] + 1;
    }

    if (pattern[j] === string[i]) {
      j++;
    }
    if (j === m) {
      return i - m + 1;
    }
    i++;
  }

  return -1;
}
