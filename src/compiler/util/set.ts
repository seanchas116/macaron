
export
function intersection<T>(xs: Set<T>, ys: Set<T>) {
  const ret = new Set<T>();
  for (const y of ys) {
    if (xs.has(y)) {
      ret.add(y);
    }
  }
  return ret;
}

export
function union<T>(xs: Set<T>, ys: Set<T>) {
  const ret = new Set<T>();
  for (const x of xs) {
    ret.add(x);
  }
  for (const y of ys) {
    ret.add(y);
  }
  return ret;
}
