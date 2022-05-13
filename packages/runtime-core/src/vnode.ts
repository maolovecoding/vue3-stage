import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";

export interface IVnode {
  type: any;
  props: any;
  children: string | any[] | null;
  key: string;
  el: null | HTMLElement; // 真实节点 -> dom
  __v_isVnode: boolean;
  shapeFlag: ShapeFlags;
  component: any;
}
// 将儿子的类型统一记录在vnode中的shapeFlag上
function normalizeChildren(vnode: IVnode, children: any) {
  let type = 0;
  if (children == null) return; // 么有儿子 不做处理
  else if (isArray(children)) {
    // 孩子是数组
    type |= ShapeFlags.ARRAY_CHILDREN;
  } else {
    // 孩子是文本
    type |= ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeFlag |= type;
}

// 创建虚拟节点 -> 描述真实节点的一个对象
export function createVnode(type: any, props: any, children = null): IVnode {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
  const vnode: IVnode = {
    __v_isVnode: true,
    type,
    props,
    children, // 组件的children是插槽
    key: props.key,
    el: null,
    shapeFlag,
    component: null, // 组件的实例
  };
  // 等会做diff算法 肯定需要一个老的虚拟节点（对应真实的DOM），新的虚拟节点
  // 虚拟节点对比差异 将差异反应到真实的节点上
  normalizeChildren(vnode, children);
  return vnode;
}
