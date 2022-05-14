import { isArray, isObject } from "@vue/shared";
import { createVnode, IVnode } from "./vnode";

function isVnode(vnode: any): vnode is IVnode {
  return vnode.__v_isVnode === true;
}
/**
 *
 * @param type 第一个参数是类型
 * @param propsOrChildren 第二个参数可能是属性 也可能是儿子 没有属性只有孩子的情况 孩子必须是数组
 * @param children 第三个参数一定是儿子 一个的情况可以写文本 多个必须用数组
 */
export function h(type, propsOrChildren, children) {
  const len = arguments.length;
  if (len === 2) {
    // h("div", h("p"))
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      }else{
        // 元素文本
        return createVnode(type, propsOrChildren);
      }
    } else {
      // propsOrChildren 是数组
      return createVnode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      children = Array.from(arguments).slice(2);
    } else if (len === 3 && isVnode(children)) {
      // 可能children是一个文本 也可能是一个数组
      // 文本不需要变成数组 文本是可以直接innerText的
      children = [children]; // h("div", {}, h("p"))
    }
    return createVnode(type, propsOrChildren, children);
  }
}
