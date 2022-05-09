// 这里是我们要针对 monorepo 进行项目编译

// node来解析packages目录
const fs = require("fs");
const path = require("path");
// 可以理解为打开一个进程去做打包操作
const execa = require("execa");
// 读取需要打包的文件夹
const dirs = fs
  .readdirSync(path.resolve(__dirname, "../packages"))
  .filter((p) => {
    // 只要文件夹
    return fs.statSync(`packages/${p}`).isDirectory();
  });

// 并行打包所有文件夹
async function build(target) {
  // NODE_ENV=
  // -c使用配置文件 后面表示注入环境变量 TARGET:xxx
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    // 子进程的输出在父进程打印
    stdio: "inherit",
  });
}

// 并发去打包 每次打包都调用build方法
async function runParallel(dirs, iterFn) {
  let result = [];
  for (let item of dirs) {
    result.push(iterFn(item));
  }
  // 存储打包时的promise 等待所有全部打包完毕后 成功
  return Promise.all(result);
}

runParallel(dirs, build).then(() => {
  console.log("成功！");
});
