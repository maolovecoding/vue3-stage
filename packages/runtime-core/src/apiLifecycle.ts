import {
  currentInstance,
  setCurrentInstance as setCurrInstance,
} from "./component";

const enum LifeCycles {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
}
export const getCurrentInstance = () => {
  return currentInstance;
};
export const setCurrentInstance = (instance) => {
  setCurrInstance(instance);
};
function injectHook(lifecycle, hook, target) {
  // target 指向的就是当前组件的实例 也就是生命周期的实例
  // 生命周期很多，用栈结构也不好记录当前实例，在父子组件上，可能先执行父组件的生命周期
  // 也可以先执行子组件的生命周期，但是我们利用了闭包特性，target肯定指向的是正确的组件实例
  if (!target) return;
  const hooks = target[lifecycle] || (target[lifecycle] = []);
  const wrap = () => {
    setCurrentInstance(target);
    hook(); // 执行生命周期前 用存储的正确的实例替换回去 保证instance的正确性
    setCurrentInstance(null);
  };
  hooks.push(wrap);
}

function createHook(lifecycle: LifeCycles) {
  return function (hook, target = currentInstance) {
    // currentInstance 就是全局的当前实例
    // 利用函数的闭包特性
    injectHook(lifecycle, hook, target);
  };
}
export function invokeArrayFns(fns: Function[]) {
  fns.forEach((fn) => fn());
}

export const onBeforeMount = createHook(LifeCycles.BEFORE_MOUNT);
export const onMounted = createHook(LifeCycles.MOUNTED);
export const onBeforeUpdate = createHook(LifeCycles.BEFORE_UPDATE);
export const onUpdated = createHook(LifeCycles.UPDATED);
