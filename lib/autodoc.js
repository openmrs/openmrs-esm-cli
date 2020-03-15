const path = require("path");
const jest = require('jest');
// const singleSpa = require("single-spa");
require('ts-node').register(
  Object.assign(
    {
      ignore: [/\.js/],
    },
    require('../tsconfig.json'),
  ),
);
jest.enableAutomock();

module.exports = async function(opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  console.log(cwd);
  const entrypoint = path.resolve(cwd, opts.entrypoint);
  try {
    const program = await require(entrypoint);

    console.log(program);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
