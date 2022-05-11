import { isArray, isIntegerKey, hasOwn } from "./../../shared/src/index";
import { extend, hasChanged, isObject, logger } from "@vue/shared";
import { reactive, readonly } from "./reactive";
import { track, trigger } from "./effect";
/**
 *
 * @param isReadonly 是否仅读
 * @param shallow 是否是浅层的
 */
const createGetter = (isReadonly = false, shallow = false) => {
  return function (
    target: any,
    key: string | symbol | number,
    receiver: any
  ): any {
    const res = Reflect.get(target, key, receiver);
    // logger(`${JSON.stringify(target)}触发的${key as any}取值操作`);
    if (shallow) return res;
    if (!isReadonly) {
      // 不是只读属性 进行依赖收集 收集当前属性 如果属性变化可能需要更新视图
      track(target, "get", key);
    }
    if (isObject(res)) {
      // 再次代理对象 懒代理取值的时候才会出现二次代理
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
  /*
    vue3 真的是对象来进行劫持 不需要改写原来的镀锡 如果是嵌套的对象 当取值才会进行二次贷代理
    vue3 可以对不存在的属性进行获取 也会走get方法
    proxy原生支持数组
  */
};

const createSetter = () => {
  return function (
    target: any,
    key: string | symbol | number,
    value: any,
    receiver: any
  ): boolean {
    // 针对数组而言 如果调用push方法，就会产生2次触发
    // 第一次相当于给数组新增了一项，同时也更改的长度
    // 第二次触发更新长度 length ，因为第一次触发已经更新了，第二次没什么意义
    const oldVal = Reflect.get(target, key, receiver);
    // 设置属性 可能是新增 也可以是修改 -> 判断数组是新增还是修改
    const hasKey =
      isArray(target) && isIntegerKey(key)
        ? // 数组 且不是length属性
          Number(key) < target.length
        : // 对象
          hasOwn(target, key);
    if (!hasKey) {
      trigger(target, "add", key, value);
      // 新增
      return Reflect.set(target, key, value, receiver);
    } else if (hasChanged(oldVal, value)) {
      trigger(target, "set", key, value, oldVal);
      // 修改
      const res = Reflect.set(target, key, value, receiver);
      logger(
        `对 ${JSON.stringify(target)} 的 ${
          key as any
        } 进行设值操作：newValue = ${JSON.stringify(value)}`,
        "color:red"
      );
      return res;
    }
    logger(
      `${key as any} 设置重复的值：${JSON.stringify(value)}`,
      "color: orange"
    );
    // return false;// 返回false浏览器在严格模式下会报错误
    return true;
  };
};

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter();

export const mutableHandler = {
  get,
  set,
};
export const shallowReactiveHandler = {
  get: shallowGet,
  set: shallowSet,
};

const readonlySet = {
  set(target: any, key: any, value: any) {
    console.warn(`cannot set ${JSON.stringify(value)} on ${key} failed`);
    return false;
  },
};

export const readonlyHandler = extend(
  {
    get: readonlyGet,
  },
  readonlySet
);
export const shallowReadonlyHandler = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlySet
);
