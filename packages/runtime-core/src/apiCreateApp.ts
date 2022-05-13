import { createVnode } from "./vnode";
export type Render = (vnode: any, container: HTMLElement) => any;
interface IApp {
  _component: any;
  _props: any;
  _container: null | HTMLElement;
  mount: (container: HTMLElement) => any;
}

export function createAppAPI(render: Render) {
  return (rootComponent: any, rootProps = null) => {
    const app: IApp = {
      // 全局方法：app.component directives mixin等
      // 为了稍后组件挂载之前可以先校验组件是否有render函数或者template
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container: HTMLElement) {
        // 1. 根据用户传入的组件生成一个虚拟节点 vnode
        const vnode = createVnode(rootComponent, rootProps);
        app._container = container;
        // 2. 将虚拟节点变成真实节点，插入到对应的容器中
        render(vnode, container);
      },
    };
    return app;
  };
}
