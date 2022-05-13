import { IVnode } from "./vnode";
import { createAppAPI, Render } from "./apiCreateApp";
import { ShapeFlags } from "@vue/shared";
let uid = 0;
function createComponentInstance(vnode: IVnode) {
  const instance = {
    uid: uid++,
    vnode, // 实例上的vnode就是我们处理过的vnode
    type: vnode.type, // 组件本身
    props: {}, // 父组件传递的属性 在props中声明过的
    attrs: {}, // 默认所有属性都放到attrs上，如果在props声明了，就放到props里面了
    slots: {}, // 组件就是插槽
    setupState: {}, // setup函数的返回值
    proxy: null,
    emit: null, // 组件通信
    ctx: {}, // 上下文
    isMounted: false,
    subTree: null, // 组件的渲染内容
    render: null,
  };
  instance.ctx = {
    _: instance, // 将自己放到了上下文中 在生产环境中 + _ 标识不希望用户访问里面的变量
  };
  return instance;
}
// 根据实例获取上下文
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: () => {}, // 是为了表示组件暴露了那些方法，用户可以通过ref调用暴露的那些方法
  };
}
function setupStatefulComponent(instance) {
  const Component = instance.type; // 就是我们传入的组件对象
  const { setup } = Component;
  if (setup) {
    const setupContext = createSetupContext(instance);
    const setupResult = setup(instance.props, setupContext);
    console.log(setupResult)
  }
}

function setupComponent(instance) {
  const { props, children } = instance.vnode;
  // 初始化属性 初始化插槽
  instance.props = props;
  instance.slots = children;
  // 函数式组件 / 状态组件->调用setup函数
  setupStatefulComponent(instance);
}
// 不关心平台
export function createRenderer(renderOptions: any) {
  const mountComponent = (n2: IVnode, container) => {
    // 组件的创建 需要产生一个组件的实例 调用组件实例上的setup方法拿到render函数
    // 调用render函数 拿到组件对应的虚拟dom（不是组件的虚拟dom）是组件要渲染的内容的vnode （子树subTree）
    const instance = (n2.component = createComponentInstance(n2));
    // 给instance增加属性 调用setup函数 拿到函数的返回值
    setupComponent(instance);
    return instance; // 根据虚拟节点产生创造一个实例
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
  const patch = (n1, n2, container) => {
    // n2可能是元素 可能是组件 我们需要判断具体的类型
    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 元素虚拟节点
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 组件虚拟节点
      processComponent(n1, n2, container);
    }
  };
  const render: Render = (vnode: IVnode, container: HTMLElement) => {
    // 后续还有更新逻辑
    patch(null, vnode, container);
  };
  return {
    createApp: createAppAPI(render),
    render,
  };
}
