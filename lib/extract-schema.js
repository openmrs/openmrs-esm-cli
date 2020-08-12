const Module = require("module");

require("ts-node").register(
  Object.assign(
    {
      ignore: [/\.js/],
      dir: __dirname,
    },
    require("../tsconfig.json")
  )
);

module.exports = async function extractSchema(entrypoint, dependencies) {
  const validators = await require("../node_modules/@openmrs/esm-module-config/src/validators/validators.ts");
  // We are going to use the moduleConfigStub to steal the module
  // name and schema from the entrypoint file
  let moduleName, moduleSchema;
  // We will stub custom validator functions in order to extract their messages
  const validatorStub = (fcn, message) => () => message;
  // This is the stub. Once it gets the schema, it throws in order to abort
  // the entrypoint require, returning control flow to this program
  const moduleConfigStub = {
    defineConfigSchema: (name, schema) => {
      moduleName = name;
      moduleSchema = schema;
      throw "GOT SCHEMA";
    },
    validators: validators,
    validator: validatorStub,
  };

  // Hack nodejs require
  const entrypointFilename = /[^/]*$/.exec(entrypoint)[0];
  const allowedImports = [".*" + entrypointFilename].concat(dependencies);
  let originalRequire = Module.prototype.require;
  Module.prototype.require = function () {
    const name = arguments[0];
    if (allowedImports.some((i) => name.match(i))) {
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
      return { name: moduleName, schema: moduleSchema };
    } else {
      throw e;
    }
  }
};
