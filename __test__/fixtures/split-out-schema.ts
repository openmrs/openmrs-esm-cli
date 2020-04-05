import { validators, validator } from "@openmrs/esm-module-config";

export default {
  foo: {
    default: "tsx",
    validators: [
      validators.isString,
      validators.isBoolean,
      validator((x) => true, "it's ok"),
    ],
  },
};
