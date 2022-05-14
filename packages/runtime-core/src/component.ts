import { hasOwn, isFunction, isObject } from "@vue/shared";
import componentPublicInstance from "./componentPublicInstance";
import type { IVnode } from "./vnode";
let uid = 0;
export function createComponentInstance(vnode: IVnode) {
  const instance = {
    uid: uid++,
    vnode, // 实例上的vnode就是我们处理过的vnode
    type: vnode.type, // 组件本身
    props: {}, // 父组件传递的属性 在props中声明过的
    attrs: {}, // 默认所有属性都放到attrs上，如果在props声明了，就放到props里面了
    slots: {}, // 组件就是插槽
    setupState: {}, // setup函数的返回值是对象 放这里
    proxy: null,
    emit: null, // 组件通信
    ctx: {}, // 上下文
    isMounted: false,
    subTree: null, // 组件的渲染内容
    render: null, // setup返回值是render函数放这里
  };
  instance.ctx = {
    _: instance, // 将自己放到了上下文中 在生产环境中 + _ 标识不希望用户访问里面的变量
  };
  return instance;
}

export function setupComponent(instance) {
  const { props, children } = instance.vnode;
  // 初始化属性 初始化插槽
  instance.props = props;
  instance.slots = children;

  // 创建组件实例的代理
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
  // 函数式组件 / 状态组件->调用setup函数
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const Component = instance.type; // 就是我们传入的组件对象
  const { setup } = Component;
  if (setup) {
    const setupContext = createSetupContext(instance);
    // setup函数的返回值 函数或者是一个普通对象
    const setupResult = setup(instance.props, setupContext);
    handleSetupResult(instance, setupResult);
  }
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
// 处理setup函数的返回值
function handleSetupResult(instance, setupResult) {
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  } else if (isFunction(setupResult)) {
    instance.render = setupResult;
  }
  // 处理后可能没有render 1）没有render函数 2）用户写了setup，但是没有返回值
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  // setup返回值不是render函数 我们需要拿到组件上的render
  const Component = instance.type;
  if (!instance.render) {
    if (!Component.render && Component.template) {
      // 没有render函数 setup返回值也不是render函数
      // 需要把模板编译为render -> compileToFunction
    }
    instance.render = Component.render;
  }
}
