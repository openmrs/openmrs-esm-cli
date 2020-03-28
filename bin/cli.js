#!/usr/bin/env node

const program = require("commander");
const version = require("../package.json").version;
const autodoc = require("../lib/autodoc.js");

program.description("Generate Markdown documentation for a config schema");
program.version(version);
program.option(
  "-o, --outfile <outfile.md>",
  "change the output file",
  "README.md"
);
program.option(
  "-e, --entrypoint <entrypoint.js>",
  "path to file containing defineConfigSchema call",
  "src/root.component.tsx"
);
program.option(
  "--cwd <cwd>",
  "override the path to use as the current working directory"
);

program.parse(process.argv);

program.log = (...args) => console.log(...args);

autodoc(program).catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
