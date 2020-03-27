const path = require("path");
var Module = require("module");

require("ts-node").register(
  Object.assign(
    {
      ignore: [/\.js/],
      dir: __dirname
    },
    require("../tsconfig.json")
  )
);

module.exports = async function(opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const entrypoint = path.resolve(cwd, opts.entrypoint);

  // We are going to use the moduleConfigStub to steal the module
  // schema from the entrypoint file
  var moduleSchema;
  // This is the stub. Once it gets the schema, it throws in order to abort
  // the entrypoint require, returning control flow to this program
  const moduleConfigStub = {
    defineConfigSchema: (moduleName, schema) => {
      moduleSchema = schema;
      throw "GOT SCHEMA"
    },
    validators: { isString: () => {} }
  };

  // Hack nodejs require
  var originalRequire = Module.prototype.require;
  Module.prototype.require = function() {
    const name = arguments[0];
    const entrypointFilename = /[^/]*$/.exec(opts.entrypoint)[0];
    if (name.match(new RegExp(".*" + entrypointFilename))) {
      // actually require the entrypoint
      const realModule = originalRequire.apply(this, arguments);
      return realModule;
    } else if (name.match(/.*@openmrs\/esm-module-config/)) {
      // return our module-config stub
      return moduleConfigStub;
    } else {
      // return nothing for everything else
      return {};
    }
  };

  try {
    require(entrypoint);
  } catch (e) {
    if (e === "GOT SCHEMA") {
      console.log(moduleSchema);
    } else {
      console.error(e.stack);
      process.exit(1);
    }
  }
};
