// 需要支持dom创建的API 以及属性处理的API
import { extend } from "@vue/shared";
import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";

import { patchProp } from "./patchProps";

const renderOptions = extend(nodeOps, { patchProp });
// 拿到用户传入的组件和属性 需要床组件的虚拟节点（diff算法） 然后把虚拟节点变成真实节点
export function createApp(rootComponent: any, rootProps = null) {
  const app = createRenderer(renderOptions).createApp(rootComponent, rootProps);
  let { mount } = app;
  app.mount = function (container: string | HTMLElement) {
    if (typeof container === "string") {
      container = (renderOptions as any).querySelector(container);
    }
    (container as HTMLElement).innerHTML = "";
    // 我们在runtime-dom重写的mount方法 会对容器进行清空
    mount(container as HTMLElement);
  };
  return app;
}
