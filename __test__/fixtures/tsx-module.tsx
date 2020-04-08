import React from "react";
import {
  defineConfigSchema,
  validators,
  validator,
} from "@openmrs/esm-module-config";
import style from "tsx-module.css";

defineConfigSchema("tsx-module", {
  foo: {
    description: "The most beautiful string you can think of",
    default: "tsx",
    validators: [
      validators.isString,
      validators.isBoolean,
      validator((x) => true, "it's ok"),
    ],
  },
  bar: {
    baz: {
      default: "baz def",
    },
    description: "higher-level description",
    validators: [validator(() => {}, "higher-level validator")],
  },
  qux: {
    default: "quxxy",
  },
});
