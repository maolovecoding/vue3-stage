import { isArray, isIntegerKey } from "@vue/shared";
interface IOptions {
  lazy?: boolean;
  scheduler?: (effect: IEffect) => void;
}
interface IFn {
  (...args: any): any;
}
export interface IEffect {
  (...args: any): any;
  id: number;
  __isEffect: boolean;
  options?: IOptions;
  deps: any[];
}
/**
 * 收集副作用
 * @param fn
 * @param options
 */
export function effect(fn: IFn, options?: IOptions) {
  const effect = createReactiveEffect(fn, options);
  if (!options?.lazy) {
    // 不是懒执行 先执行一次副作用函数
    effect();
  }
  return effect;
}

const effectStack: IEffect[] = [];
export let activeEffect: IEffect | null = null;
let id = 0;
/**
 * 当用户取值的时候需要将activeEffect和属性做关联
 * 当用户更改的时候 要 通过属性找到effect重新执行
 * @param fn
 * @param options
 * @returns
 */
function createReactiveEffect(fn: IFn, options?: IOptions) {
  // 这就是 effect中的effect
  const effect: IEffect = function reactiveEffect() {
    try {
      effectStack.push(effect);
      activeEffect = effect;
      return fn();
    } catch (error) {
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effect.id = id++;
  effect.__isEffect = true;
  effect.options = options;
  effect.deps = []; // 收集依赖的属性
  return effect;
}

/**
 * 依赖更新 触发副作用函数
 * @param target
 * @param type
 * @param key
 * @param newVal
 * @param oldVal
 */
export function trigger(
  target: any,
  type: "set" | "add" | "get",
  key: string | symbol | number,
  newVal: any,
  oldVal?: any
) {
  // 触发更新 去映射表中 找对应属性的副作用集合 重新执行
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 更新了属性值 没有在effect中使用该属性 不需要执行依赖
  const effects = new Set<IEffect>();
  const add = (effectsSet: Set<IEffect>) => {
    // 如果同时有多个属性发生更新 依赖的effect是同一个 使用set还可以过滤
    if (effectsSet) {
      effectsSet.forEach((effect) => effects.add(effect));
    }
  };
  /*
    1. 如果更改了数组长度 小于依赖收集的长度 要触发重新渲染
    2. 如果调用了push方法 或者其他新增数组的方法（会在增加元素的时候修改长度的方法）也要触发更新
  */
  // 是数组 修改了length属性的值
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep: Set<IEffect>, key: string | symbol | number) => {
      // 新的length长度小于老的长度 才对数组已有的元素有影响
      if (newVal < oldVal || key === "length") {
        add(dep);
      }
    });
  } else {
    add(depsMap.get(key));
    switch (type) {
      case "add":
        // 给数据添加元素 且修改了数组索引 -> push unshift 等方法 在添加原始的同时直接修改一次length
        if (isArray(target) && isIntegerKey(key)) {
          // 增加属性 需要触发 length的依赖收集
          add(depsMap.get("length"));
        }
        break;
      case "set":
        break;
      case "get":
        break;
    }
  }
  effects.forEach((effect) => {
    // 有用户的选项 将副作用函数交给用户执行
    if (effect.options?.scheduler) {
      return effect.options.scheduler(effect);
    }
    effect();
  });
}

const targetMap = new WeakMap();
/**
 * 收集副作用
 * target -> key -> [effect,effect,...]
 * weakMap(target,key) -> key(set->effect)
 * @param target
 * @param type
 * @param key
 */
export function track(
  target: any,
  type: "set" | "add" | "get",
  key: string | symbol | number
) {
  // null / undefined 用户只是取了值 且不是在effect中使用的 什么都不需要收集
  if (activeEffect == null) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // deps -> effect
  if (!deps.has(activeEffect)) deps.add(activeEffect);
}
