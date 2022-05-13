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

export const enum ShapeFlags {
  ELEMENT = 1, // 标识是一个元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2, // 带状态的组件
  TEXT_CHILDREN = 1 << 3, // 孩子是文本
  ARRAY_CHILDREN = 1 << 4, // 孩子是数组
  SLOTS_CHILDREN = 1 << 5, // 插槽孩子
  TELEPORT = 1 << 6, // 传送门
  SUSPENSE = 1 << 7, // 实现异步组件等待
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 是否需要keep-alive
  COMPONENT_KEPT_ALIVE = 1 << 9, // 组件的keep-alive
  // 组件 = 函数式组件 + 带状态的组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 110
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
