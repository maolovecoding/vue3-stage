export function isObject(source: any): source is object {
  return source !== null && typeof source === "object";
}
export function extend(target: object, source: object) {
  return Object.assign({}, target, source);
}

export function logger(data: any, style?: string) {
  console.log(`%c${data}`, style ?? "color:blue");
}

export function hasChanged(oldVal: unknown, newVal: unknown) {
  return !Object.is(oldVal, newVal);
}
export const isArray = Array.isArray;

// 是否是一个数字
export const isIntegerKey = (key: any) => parseInt(key) + "" === key;

export const hasOwn = (target: any, key: string | symbol | number) =>
  Object.prototype.hasOwnProperty.call(target, key);
