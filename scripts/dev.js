// 可以理解为打开一个进程去做打包操作
const execa = require("execa");

// 并行打包所有文件夹
async function build(target) {
  // NODE_ENV=
  // -c使用配置文件 后面表示注入环境变量 TARGET:xxx
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    // 子进程的输出在父进程打印
    stdio: "inherit",
  });
}

// 打包指定模块
const modules = process.argv.slice(2);
// 没有指定打包的模块 就打包该模块
if (modules.length === 0) build("runtime-dom");
else
  modules.forEach((module) => {
    // 循环打包
    build(module);
  });
