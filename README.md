# vue3的学习

## 使用yarn进行管理

所有的模块都放在`packages`下面
在整个大项目的package.json上标志工作空间：

```json
  "workspaces": [
    "packages/*"
  ],
```

然后每个单独的小项目也需要生成自己的`package.json`，作为整个项目的包。

### 安装typescript

安装ts到整个项目上，可以进行所有包的共享。

```shell
yarn add typescript -W
```

### 安装rollup和插件

```shell
yarn add rollup rollup-plugin-typescript2 @rollup/plugin-node-resolve execa -D -W
```

`execa`可以帮助我们在代码里面启动一个命令行帮助我们执行代码。

### Vue3 & Vue2 对比总结

**vue3和vue2的区别：**

项目架构上：

vue3采用monorepo的方式，可以让我们一个项目下管理多个项目，每个包可以单独的使用和发布，（依赖关系）

Vue3 （reactivity  ->  runtime-core  -> runtime-dom） ---- 就是运行时模块 runtime-only,这三个包不具备模板编译的能力。

（compiler-dom  -> compiler-core）模板编译想比于vue2做了那些优化？

Vue3基于Ts，Options APi缺陷是不能tree-shaking，组合式（composition）API对tree-shaking支持好。

**内部优化：**

Vue3使用proxy，好处就是可以支持数组和对象，不用一上来就递归，不用改写属性的get和set

Vue3采用了composition API ，实现了方便代码的复用（解决了mixin的问题 - 》命名冲突，数据来源不明确等）

Vue3中的diff算法，采用最长递归子序列 和 暴力递归对比（全量对比浪费性能）

vue3中的优化，模板编译-》BlockTree。（block 块）。

模板编译：template -> render函数。将html语法进行解析，解析成一个ast语法树，然后会对这个树就行优化（标记那些节点是变化的patchFlag -》 可以明确的字段那些是变化的，那些是没变的，这样做diff算法之前，我们可以筛选出只比较变化的属性，也就是**靶向更新**），然后生成render函数

block节点拥有一个功能，可以收集动态的节点，dynamicChildren，把动态的属性收集到这里，下次更新的时候，按照数组的方式来进行更新

block有很多地方解决不了，block无法解决节点不稳定的情况，会导致更新失败。我们会给导致不稳定的标签加上block，这样就组成了一个blockTree（靶向更新，你得有一个目标， 123 -》 1234 只能采用全量diff，因为没有对应的目标去对比）

Vue3里面在编译的时候，采用blockTree+patchFlag的方式

vue3静态提升，属性提升，字符串化，事件缓存
