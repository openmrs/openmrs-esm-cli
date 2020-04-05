import React from "react";
import {
  defineConfigSchema,
  validators,
  validator,
} from "@openmrs/esm-module-config";
import style from "tsx-module.css";

defineConfigSchema("tsx-module", {
  foo: {
    default: "tsx",
    validators: [
      validators.isString,
      validators.isBoolean,
      validator((x) => true, "it's ok"),
    ],
  },
  qux: {
    default: "quxxy",
  },
});
