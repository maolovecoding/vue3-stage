import { isObject } from "@vue/shared";
import { effect, IEffect, track, trigger } from "./effect";

type ComputedOptions<T> = { get: () => any; set: (newVal: T) => void };
type ComputedType<T> = (() => T) | ComputedOptions<T>;
// 计算属性的实现
export function computed<T>(getterOrOptions: ComputedType<T>) {
  let getter: () => T;
  let setter: (newVal: T) => void;
  if (isObject(getterOrOptions)) {
    getter = (getterOrOptions as any).get;
    setter = (getterOrOptions as any).set;
  } else {
    getter = getterOrOptions;
    setter = () => {
      console.log("setter");
    };
  }
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl<T> {
  public effect: IEffect;
  private _value!: T;
  private dirty = true;
  constructor(public getter: () => T, public setter: (newVal: T) => void) {
    // fn -> 执行计算属性的getter
    // 我们传入了scheduler 下次数据更新，原则上应该让effect重新执行
    // 下次更新 会调用scheduler函数
    this.effect = effect(getter, {
      // 计算属性只有用到的时候才会执行
      lazy: true,
      // 自己来执行逻辑
      scheduler: (effect) => {
        if (!this.dirty) {
          this.dirty = true;
          // 触发更新
          trigger(this, "get","value",this._value);
        }
      },
    });
  }
  get value() {
    if (this.dirty) {
      this._value = this.effect();
      this.dirty = false;
    }
    // 只要访问了value属性 就进行依赖收集
    track(this, "get", "value");
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}
