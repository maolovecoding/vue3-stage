import { hasOwn } from "@vue/shared";

// 组件实例的代理 的捕获器
export default {
  // get(target, key,receiver) {},
  get({ _: instance }, key, receiver) {
    const { setupState, props, ctx } = instance;
    // 先去 setupState中取值 然后去上下文中查找（自身设置的某些属性） 再去props取值
    if (hasOwn(setupState, key)) {
      return Reflect.get(setupState, key);
    } else if (hasOwn(ctx, key)) {
      return Reflect.get(ctx, key);
    } else if (hasOwn(props, key)) {
      return Reflect.get(props, key);
    }
  },
  set({ _: instance }, key, value, receiver) {
    const { setupState, props } = instance;
    // 先去 setupState中设置值 再去props设置值
    if (hasOwn(setupState, key)) {
      return Reflect.set(setupState, key, value);
    } else if (hasOwn(props, key)) {
      return Reflect.set(props, key, value);
    }
    return true;
  },
};
