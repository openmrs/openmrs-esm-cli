const path = require("path");
const extractSchema = require("./extract-schema");

module.exports = async function(opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const entrypoint = path.resolve(cwd, opts.entrypoint);
  const configSchema = extractSchema(entrypoint);
  console.log(configSchema);
}