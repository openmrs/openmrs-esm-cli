import React from "react";
import { defineConfigSchema } from "@openmrs/esm-module-config";
import schema from "./split-out-schema"

defineConfigSchema("tsx-module", schema);
