const fs = require("fs-extra");
const path = require("path");
// const singleSpa = require("single-spa");
const System = require("systemjs");

module.exports = async function(opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const packageJsonPath = path.resolve(cwd, "package.json");
  const packageJson = readPackageJson(packageJsonPath);
  console.log(packageJson.main);
  const program = require("./" + packageJson.main.replace(".js", ""));
  //try {
    //const program = await import(packageJson.main);
  //} catch (e) {
    //console.log(e);
  //}
};

function readPackageJson(path) {
  let file;
  try {
    file = fs.readFileSync(path);
  } catch {
    throw Error(`File does not exist: '${path}'`);
  }
  try {
    return JSON.parse(file);
  } catch {
    throw Error(
      `File is not valid json (expected a package.json file): '${path}'`
    );
  }
}
