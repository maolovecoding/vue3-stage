/*
 * @Author: 毛毛
 * @Date: 2022-05-09 15:48:53
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-05-09 16:47:41
 */
import { isObject } from "@vue/shared";
import {
  mutableHandler,
  shallowReactiveHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandlers";

// 默认是深度代理
// 是否是仅读 的
export function reactive<T extends object>(target: T) {
  return createReactiveObject(target, false, mutableHandler);
}
export function shallowReactive<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReactiveHandler);
}

export function readonly<T extends object>(target: T) {
  return createReactiveObject(target, false, readonlyHandler);
}

export function shallowReadonly<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReadonlyHandler);
}

// 缓存代理对象
// , InstanceType<typeof Map>
const reactiveMap = new WeakMap<object>();
const readonlyMap = new WeakMap<object>();
/**
 *
 * @param target 目标对象
 * @param isReadonly 是否只读
 * @param baseHandle针对不同的方式创建不同的代理对象
 */
function createReactiveObject<T extends object>(
  target: T,
  isReadonly: boolean,
  baseHandle: ProxyHandler<object>
) {
  if (!isObject(target)) return target;
  const existProxy = (isReadonly ? readonlyMap : reactiveMap).get(target);
  if (existProxy) return existProxy;
  const proxy = new Proxy(target, baseHandle);
  reactiveMap.set(target, proxy);
  return proxy;
}
