var {
  defineConfigSchema,
  validators,
  validator,
} = require("@openmrs/esm-module-config");

defineConfigSchema("nodejs-module", {
  foo: {
    default: "js",
    validators: [
      validators.isString,
      validators.isBoolean,
      validator((x) => true, "it's ok"),
    ],
  },
});
