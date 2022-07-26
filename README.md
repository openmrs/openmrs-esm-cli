# Defunct

Tooling for the OpenMRS 3 Frontend is located [in openmrs-esm-core](https://github.com/openmrs/openmrs-esm-core/tree/master/packages/tooling).

There is no more documentation generation for configuration. Configuration documentation is now displayed through the Implementer Tools UI.

# openmrs-esm-cli

Node scripts supporting OpenMRS Microfrontends.

## config-autodoc

```
npx config-autodoc --help

Generate Markdown documentation for a config schema

Options:
  -V, --version                     output the version number
  -o, --outfile <outfile.md>        change the output file (default: "README.md")
  -e, --entrypoint <entrypoint.js>  path to file containing defineConfigSchema call (default: "src/root.component.tsx")
  --cwd <cwd>                       override the path to use as the current working directory
  -h, --help                        output usage information
```
