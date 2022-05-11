import { isArray } from './../../shared/src/index';
import { hasChanged, isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export function ref<T>(value: T) {
  // 把普通值变成一个引用类型 让一个普通值变成对象
  return createRef(value);
}

export function shallowRef<T>(value: T) {
  return createRef(value, true);
}

export function toRef<T>(target: T, key: keyof T) {
  return new ObjectRefImpl(target, key);
}

export function toRefs<T>(target: T) {
  const refs:any = isArray(target) ? new Array(target.length) : {};
  for(const key in target){
    refs[key] = toRef(target,key);
  }
  return refs;
}

function createRef<T>(value: T, shallow: boolean = false) {
  // 借助类的属性访问器
  return new RefImpl(value, shallow);
}

class RefImpl<T> {
  private _value: T;
  private __v_isRef = true;
  constructor(public rawValue: T, public shallow: boolean) {
    this._value = shallow ? rawValue : convert(rawValue);
  }
  // 收集依赖
  get value() {
    track(this, "get", "value");
    return this._value;
  }
  set value(newVal) {
    // 有变化 更新值
    if (hasChanged(newVal, this.rawValue)) {
      // 触发更新
      this.rawValue = newVal;
      this._value = this.shallow ? newVal : convert(newVal);
      trigger(this, "set", "value", newVal);
    }
  }
}

function convert<T>(value: T) {
  return isObject(value) ? reactive(value) : value;
}

class ObjectRefImpl<T> {
  public __v_isRef = true;
  constructor(public target: T, public key: keyof T) {}

  get value() {
    return this.target[this.key];
  }
  set value(newVal) {
    this.target[this.key] = newVal;
  }
}
