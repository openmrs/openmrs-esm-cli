#!/usr/bin/env node

const program = require("commander");
const version = require("../package.json").version;
const autodoc = require("../lib/autodoc.js");

program.version(version);
program.option("-o, --outfile <outfile.md>", "change the output file", "README.md");
program.option(
  "-e, --entrypoint <entrypoint.js>",
  "path to app entrypoint"
);
program.option(
  "--cwd <cwd>",
  "override the path to use as the current working directory"
);
program.option("-v, --verbose", "print lots of stuff");

program.parse(process.argv);

program.log = (...args) => console.log(...args);

autodoc(program)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
