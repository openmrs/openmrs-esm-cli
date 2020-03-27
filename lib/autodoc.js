const path = require("path");
const extractSchema = require("./extract-schema");

module.exports = async function(opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const entrypoint = path.resolve(cwd, opts.entrypoint);
  const configSchema = extractSchema(entrypoint);
  const docs = generateDocFromSchema(configSchema);
  console.log(docs);
};

function generateDocFromSchema(schema, keyPath = []) {
  let doc = "";
  for (let key of Object.keys(schema)) {
    const thisKeyPath = keyPath.concat([key]);
    const startStr = "\n" + "  ".repeat(keyPath.length) + "- ";
    if (schema[key].hasOwnProperty("default")) {
      const defaultStr = " (default: " + schema[key].default + ")";
      doc += startStr + key + defaultStr;
    } else {
      // recurse
      doc += startStr + key;
      doc += generateDocFromSchema(schema[key], thisKeyPath);
    }
  }
  return doc;
}
