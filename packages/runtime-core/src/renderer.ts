import { IVnode } from "./vnode";
import { createAppAPI, Render } from "./apiCreateApp";
import { ShapeFlags } from "@vue/shared";
import { createComponentInstance, setupComponent } from "./component";
import { effect, IEffect } from "@vue/reactivity";

const queue: IEffect[] = [];
// 批量处理 多次更新 先去缓存去重 之后异步更新
function queueJob(effect: IEffect) {
  if (!queue.includes(effect)) {
    queue.push(effect);
    queueFlush();
  }
}
let isFlushing = false;
function queueFlush() {
  if (!isFlushing) {
    isFlushing = true;
    Promise.resolve().then(flushJobs);
  }
}

function flushJobs() {
  isFlushing = false; // 批处理完成
  // 先执行子还是父？
  // 排序
  queue.sort((a, b) => a.id - b.id);
  for (let i = 0; i < queue.length; i++) {
    queue[i]();
  }
  queue.length = 0;
}

// 不关心平台
export function createRenderer(renderOptions: any) {
  const {
    createElement: hostCreateElement,
    remove: hostRemove,
    insert: hostInsert,
    querySelector: hostQuerySelector,
    setElementText: hostSetElementText,
    createTextNode: hostCreateTextNode,
    setTextContent: hostSetTextContent,
    getParent: hostGetParent,
    getNextSibling: hostGetNextSibling,
    patchProp: hostPatchProp,
  } = renderOptions;

  const setupRenderEffect = (instance, container) => {
    effect(
      function componentEffect() {
        // 每次状态变化后 都会重新执行effect
        if (!instance.isMounted) {
          // 第一次渲染 render函数的参数是我们组件实例的代理对象
          // 组件渲染的内容就是subTree
          const subTree = (instance.subTree = instance.render.call(
            instance.proxy,
            instance.proxy
          ));
          patch(null, subTree, container);
          // 标识挂载
          instance.isMounted = true;
        } else {
          // 更新
          const prevTree = instance.subTree; // 旧的渲染内容 vnode
          const nextSubTree = (instance.subTree = instance.render.call(
            instance.proxy,
            instance.proxy
          )); // 新的subTree
          patch(prevTree, nextSubTree, container); // diff 算法
        }
      },
      {
        scheduler: queueJob,
      }
    );
  };
  const mountComponent = (n2: IVnode, container) => {
    // 1. 组件的创建 需要产生一个组件的实例 调用组件实例上的setup方法拿到render函数
    // 调用render函数 拿到组件对应的虚拟dom（不是组件的虚拟dom）是组件要渲染的内容的vnode （子树subTree）
    // 根据虚拟节点产生创造一个实例
    const instance = (n2.component = createComponentInstance(n2));
    // 2. 给instance增加属性 调用setup函数 拿到函数的返回值
    setupComponent(instance);
    // 3. 调用render函数 生成 subTree vnode
    // 每个组件都有一个effect
    setupRenderEffect(instance, container);
  };
  const updateComponent = (n1, n2, container) => {};

  const processComponent = (n1: IVnode, n2: IVnode, container) => {
    // 处理组件
    if (n1 == null) {
      // 挂载 创建组件
      mountComponent(n2, container);
    } else {
      // 以前有值 更新组件
      updateComponent(n1, n2, container);
    }
  };
  // 挂载子元素
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      patch(null, child, container);
    }
  };
  // 把vnode转为dom元素节点
  const mountElement = (vnode: IVnode, container, anchor) => {
    const { type, props, children, shapeFlag } = vnode;
    // 创建真实dom并放到el属性上
    const el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (const key in props) {
        // 属性
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 创建子元素
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 循环子数组挂载
      mountChildren(children, el);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    }
    // 挂载父元素
    hostInsert(el, container, anchor);
  };
  const patchProps = (el, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      for (const key in newProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  };
  // 比较孩子
  const patchKeyedChildren = (c1, c2, container) => {
    /**
     *
     */
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // sync form start
    while (i <= e1 && i <= e2) {
      // 以短的为主
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        // 同一个元素 复用
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }
    // sync form end
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 如果老的少 新的多 将新的插入到dom上即可
    if (i > e1) {
      if (i <= e2) {
        // 插入 可能是头部多 也可能是尾部多
        const nextPos = e2 + 1; // 向后追加 e2+1 肯定大于c2总长度
        const anchor = nextPos < c2.length ? c2[nextPos].el : null; // c2[nextPos].el 是需要向前插入节点的后一个兄弟节点
        while (i <= e2) {
          patch(null, c2[i++], container, anchor);
        }
      }
    } else if (i > e2) {
      //老的多 新的少
      while (i <= e1) {
        unmount(c1[i++]);
      }
    } else {
      // 乱序比对了 尽可能复用节点
      let s1 = i;
      let s2 = i;
      // vue3用新节点做映射表
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const childVnode = c2[i]; //
        keyToNewIndexMap.set(childVnode.key, i);
      }
      console.log(keyToNewIndexMap);
      const toBePatched = e2 - s2 + 1; // 将要patch的节点个数
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      // 去老节点中找 看节点是否可以复用
      for (let i = s1; i <= e1; i++) {
        const oldVnode = c1[i];
        let newIndex = keyToNewIndexMap.get(oldVnode.key);
        // 老节点找不到 卸载该节点
        if (newIndex === void 0) {
          unmount(oldVnode);
        } else {
          // 新旧节点索引的关系
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          // 节点可以复用 复用元素 更新属性 比对子节点
          patch(oldVnode, c2[newIndex], container);
        }
      }
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      let j = increasingNewIndexSequence.length - 1;
      console.log(increasingNewIndexSequence);
      // 最后就是移动节点 并且将新增的节点插入 -》 最长递增子序列
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 从后往前遍历插入节点
        let currentIndex;
        const child = c2[(currentIndex = i + s2)];
        const anchor =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          // 没有被patch过 新增
          patch(null, child, container, anchor);
        } else {
          if (i !== increasingNewIndexSequence[j]) {
            // 需要移动的节点 会导致所有节点都移动一遍 我们需要减少移动次数
            hostInsert(child.el, container, anchor);
          } else {
            // 跳过不需要移动的元素
            j--;
          }
        }
      }
      console.log(newIndexToOldIndexMap);
    }
  };
  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    /* 
      儿子的比较：
      1. 旧节点 有孩子 新节点没有
      2. 旧节点没有孩子 新节点有孩子
      3. 两方的孩子都是文本的情况 直接替换文本即可
      4. 两方都有孩子
    */
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是文本节点
      hostSetElementText(container, c2);
    } else {
      // 新的子节点是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 之前是数组 -> 两个都是数组 比较两个儿子数组
        patchKeyedChildren(c1, c2, container);
      } else {
        // 之前是文本 现在是数组
        hostSetElementText(container, "");
        mountChildren(c2, container);
      }
    }
  };
  // 来到该方法 说明两个元素可以复用
  const patchElement = (n1, n2, container) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 比较属性
    patchProps(el, oldProps, newProps);
    // 孩子
    patchChildren(n1, n2, el);
  };

  // 处理元素vnode节点
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      // diff算法
      patchElement(n1, n2, container);
    }
  };
  const isSameVnode = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };
  const unmount = (vnode) => {
    hostRemove(vnode.el);
  };
  /**
   * 比较方式 
        1： 元素的类型和key不一致，直接全部卸载重新创建新节点

   * 
   * @param n1 vnode prev
   * @param n2 vnode next
   * @param container dom容器
   */
  const patch = (n1, n2, container, anchor = null) => {
    // 判断n1和n2是否是同一个元素
    if (n1 && !isSameVnode(n1, n2)) {
      // 不是初始化 才比较两个节点是否是同一个节点
      unmount(n1); // 不是同一个节点 卸载n1的dom元素
      n1 = null;
    }
    // n2可能是元素 可能是组件 我们需要判断具体的类型
    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 元素虚拟节点;
      processElement(n1, n2, container, anchor);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 组件虚拟节点
      processComponent(n1, n2, container);
    }
  };
  const render: Render = (vnode: IVnode, container: HTMLElement) => {
    // 后续还有更新逻辑
    patch(null, vnode, container, null);
  };
  return {
    createApp: createAppAPI(render),
    render,
  };
}

function getSequence(arr: number[]): number[] {
  const len = arr.length;
  // 记录当前位置的元素的上一个元素的索引
  const p = arr.slice(0);
  const result = [0];
  let start, end, middle;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        // 当前元素索引 记录上个元素的索引
        p[i] = resultLastIndex;
        result.push(i);
        continue;
      }
      // 二分查找 找到比当前值大的那个
      start = 0;
      end = result.length - 1;
      while (start < end) {
        // middle = (start + end) >> 1;
        middle = ((start + end) / 2) | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // start == end -> 需要的索引
      if (arrI < arr[result[start]]) {
        if (start > 0) {
          // 需要替换索引
          p[i] = result[start - 1];
        }
        result[start] = i;
      }
    }
  }
  let l = result.length;
  let last = result[l - 1];
  while (l-- > 0) {
    result[l] = last;
    last = p[last];
  }
  return result;
}
