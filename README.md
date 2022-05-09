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
