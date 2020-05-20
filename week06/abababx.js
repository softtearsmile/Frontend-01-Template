function match(s) {
  let state = start;
  for (let c of s) {
    state = state(c);
  }
  return state === end;
}

console.log(match("ababcababaabababx"));
console.log(match("aaqabababx"));
console.log(match("asdsdabababx"));

function end() {
  return end;
}

function start(c) {
  if (c === "a") {
    return foundA;
  } else {
    return start;
  }
}

function foundA(c) {
  if (c === "b") {
    return foundB;
  } else {
    return start(c);
  }
}

function foundB(c) {
  if (c === "a") {
    return found2A;
  } else {
    return start(c);
  }
}

function found2A(c) {
  if (c === "b") {
    return found2B;
  } else {
    return foundA(c);
  }
}

function found2B(c) {
  if (c === "a") {
    return found3A;
  } else {
    return foundB(c);
  }
}

function found3A(c) {
  if (c === "b") {
    return found3B;
  } else {
    return found2A(c);
  }
}

function found3B(c) {
  if (c === "x") {
    return end;
  } else {
    return found2B(c);
  }
}
