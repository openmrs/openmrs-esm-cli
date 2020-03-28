
const Module = require("module");

require("ts-node").register(
  Object.assign(
    {
      ignore: [/\.js/],
      dir: __dirname
    },
    require("../tsconfig.json")
  )
);

module.exports = function extractSchema(entrypoint) {
  // We are going to use the moduleConfigStub to steal the module
  // schema from the entrypoint file
  let moduleSchema;
  // This is the stub. Once it gets the schema, it throws in order to abort
  // the entrypoint require, returning control flow to this program
  const moduleConfigStub = {
    defineConfigSchema: (moduleName, schema) => {
      moduleSchema = schema;
      throw "GOT SCHEMA"
    },
    validators: { isString: () => {}, isBoolean: () => {} },
    validator: () => {}
  };

  // Hack nodejs require
  let originalRequire = Module.prototype.require;
  Module.prototype.require = function() {
    const name = arguments[0];
    const entrypointFilename = /[^/]*$/.exec(entrypoint)[0];
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
      return moduleSchema;
    } else {
      throw e;
    }
  }
};
