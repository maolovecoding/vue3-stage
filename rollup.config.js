import tsPlugin from "rollup-plugin-typescript2";
import resolvePlugin from "@rollup/plugin-node-resolve"; //解析第三方模块
import path from "path";
// 获取packages的绝对路径
const packagesDir = path.resolve(__dirname, "./packages");
// 获取要打包的目录路径
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// 获取这个路径下的 package.json
// 根据当前需要打包的路径来解析
const resolve = (p) => path.resolve(packageDir, p);
const packageJson = require(resolve("package.json"));
const buildOptions = packageJson.buildOptions;
// path.basename(packageDir) 获取一个目录的最后一个目录名字
const name = path.basename(packageDir);
const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundle.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};
function createConfig(format, output, name) {
  // iife模式需要用到name的值
  if (name) output.name = name;
  output.sourcemap = true; // 生产sourcemap
  return {
    input: resolve(`src/index.ts`),
    output,
    plugins: [
      tsPlugin({
        tsconfig: path.resolve(__dirname, "./tsconfig.json"),
      }),
      resolvePlugin(),
    ],
  };
}
// 根据用户提供的formats选项 去我们自己的配置里取值进行生产配置文件
export default buildOptions.formats.map((format) =>
  createConfig(format, outputConfig[format], outputConfig["name"])
);

// 一个包要打包多个格式 esModule commonjs iife 等
