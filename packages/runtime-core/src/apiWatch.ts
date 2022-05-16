import { effect } from "@vue/reactivity";
import { hasChanged } from "@vue/shared";

export function watch(source, cb, options) {
  return doWatch(source, cb, options);
}

export function watchEffect(source) {
  return doWatch(source, null);
}

function doWatch(
  source,
  cb?,
  options?: { flush: "pre" | "post" | "sync"; immediate: boolean }
) {
  let oldValue;
  const scheduler = () => {
    if (cb) {
      const newValue = runner();
      if (hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }else {
      source();
    }
  };
  const runner = effect(() => source(), {
    // 默认不是立即执行
    lazy: true,
    scheduler,
  }); // 批量更新 可以缓存到数组中 开一个异步任务 做队列刷新
  if (options?.immediate) {
    scheduler();
  }
  oldValue = runner();
}
