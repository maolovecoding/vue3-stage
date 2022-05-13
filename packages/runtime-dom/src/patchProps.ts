export const patchProp = (
  el: HTMLElement,
  key: string,
  prev: any,
  next: any
) => {
  switch (key) {
    case "class": // .className
      patchClass(el, next);
      break;
    case "style": // .style.xx
      patchStyle(el, prev, next);
      break;
    default:
      if (/^on[A-Z]/.test(key)) {
        // 事件 addEventListener
        patchEvents(el, key, next);
      } else {
        // 普通属性 setAttr
        patchAttrs(el, key, next);
      }
      break;
  }
};

const patchClass = (el: HTMLElement, next: string) => {
  if (next == null) {
    next = "";
  }
  el.className = next;
};

const patchStyle = (
  el: HTMLElement,
  prev: CSSStyleDeclaration,
  next: CSSStyleDeclaration
) => {
  if (next == null) {
    el.removeAttribute("style");
  } else {
    for (const key in prev) {
      if (!next[key]) {
        el.style[key] = "";
      }
    }
    // 最新的样式需要生效
    for (const key in next) {
      el.style[key] = next[key];
    }
  }
};
interface IHTMLElement extends HTMLElement {
  _vei?: any;
}
const patchEvents = (
  el: IHTMLElement,
  key: string,
  next: (...args: any) => any
) => {
  const invokers = el._vei || (el._vei = {});
  const exists = invokers[key];
  if (exists && next) {
    // 替换事件 不需要解绑
    exists.value = next;
  } else {
    const eventName: keyof WindowEventMap = key
      .toLocaleLowerCase()
      .slice(2) as any;
    if (next) {
      // 绑定事件
      const invoke = (invokers[key] = createInvoke(next));
      el.addEventListener(eventName, invoke);
    } else {
      // 卸载事件
      el.removeEventListener(eventName, exists);
      invokers[key] = null;
    }
  }
};

const createInvoke = (fn: (...args: any) => any) => {
  const invoke = (e: any) => invoke.value(e);
  invoke.value = fn;
  return invoke;
};

const patchAttrs = (el: HTMLElement, key: string, next: any) => {
  if (next == null) el.removeAttribute(key);
  else {
    el.setAttribute(key, next);
  }
};
