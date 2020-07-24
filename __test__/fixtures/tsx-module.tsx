import React from "react";
import {
  defineConfigSchema,
  validators,
  validator,
} from "@openmrs/esm-module-config";
import style from "tsx-module.css";

defineConfigSchema("@openmrs/esm-robots", {
  robots: {
    default: [
      { name: "R2-D2", homeworld: "Naboo" },
      { name: "C-3PO", homeworld: "Tatooine" },
    ],
    arrayElements: {
      name: {
        validators: [
          validator(
            (n) => /\d/.test(n),
            "robots must have numbers in their names"
          ),
        ],
        description: "the robot's full name",
      },
      homeworld: {
        default: null,  // not required
        validators: [validators.isString],
        description: "the planet of origin, if known",
      },
    },
    validators: [
      validator((a) => a.length > 0, "at least one robot is required"),
    ],
    description: "a list of the robots that will be operating on your ship",
  },
  hologram: {
    color: {
      default: true,
      description: "whether the hologram supports color display",
    },
  },
  virtualProvider: {
    description: "the care provider to be projected into the clinic",
    name: {
      given: {
        description: "any given names",
        default: ["Qui", "Gon"],
        arrayElements: { validators: [validators.isString] },
      },
    },
  },
});
