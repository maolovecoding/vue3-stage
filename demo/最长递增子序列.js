function getSequence(arr) {
  const len = arr.length;
  // 记录当前位置的元素的上一个元素的索引
  const p = arr.slice(0);
  const result = [0];
  let start, end, middle;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        // 当前元素索引 记录上个元素的索引
        p[i] = resultLastIndex;
        result.push(i);
        continue;
      }
      // 二分查找 找到比当前值大的那个
      start = 0;
      end = result.length - 1;
      while (start < end) {
        // middle = (start + end) >> 1;
        middle = ((start + end) / 2) | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // start == end -> 需要的索引
      if (arrI < arr[result[start]]) {
        if (start > 0) {
          // 需要替换索引
          p[i] = result[start - 1];
        }
        result[start] = i;
      }
    }
  }
  let l = result.length;
  let last = result[l - 1];
  while (l-- > 0) {
    result[l] = last;
    last = p[last];
  }
  return result;
}

const res = getSequence([5, 3, 7, 4, 5, 11, 6, 9]);
console.log(res);
