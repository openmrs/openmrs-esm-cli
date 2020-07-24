var fs = require("fs");
const path = require("path");
const extractSchema = require("./extract-schema");

const specialKeys = [
  "default",
  "description",
  "validators",
  "arrayElements",
  "objectElements",
];

module.exports = async function (opts) {
  let cwd = process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const entrypoint = path.resolve(cwd, opts.entrypoint);
  const allowedDependencies = opts.dependencies
    ? opts.dependencies.split(",")
    : [];
  const { name, schema } = await extractSchema(entrypoint, allowedDependencies);
  const docString = generateDocFromSchema(schema);
  const docUrl =
    "https://github.com/openmrs/openmrs-esm-module-config#openmrs-esm-module-config";
  const preamble =
    "See the [openmrs-esm-module-config docs](" +
    docUrl +
    ")\nfor information about how to provide configuration files.\n";
  const fullDoc = `${preamble}\n\`\`\`javascript\n"${name}": {${docString}\n}\n\`\`\`\n`;
  appendOrReplaceDocstring(opts.outfile, fullDoc);
};

function generateDocFromSchema(schema, keyPath = []) {
  let doc = "";
  const keys = Object.keys(schema).filter((k) => !specialKeys.includes(k));
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const thisKeyPath = keyPath.concat([key]);
    const indents = "  ".repeat(1 + keyPath.length);
    const separator = i > 0 ? "," : "";
    const startStr = separator + "\n" + indents;
    if (isArrayOfObjectsSchema(schema[key])) {
      doc += startStr + `"${key}": [`;
      doc += documentDescriptionAndValidators(schema[key], indents);
      doc += generateArrayOfObjectsDocFromSchema(schema[key], thisKeyPath);
      doc += startStr + "]" + separator;
    } else if (isLeaf(schema[key])) {
      doc += startStr + `"${key}": ` + stringify(schema[key].default);
      doc += documentDescriptionAndValidators(schema[key], indents);
    } else {
      doc += startStr + `"${key}": {`;
      doc += documentDescriptionAndValidators(schema[key], indents);
      doc += generateDocFromSchema(schema[key], thisKeyPath); // recurse
      doc += "\n" + indents + "}";
    }
  }
  return doc;
}

function documentDescriptionAndValidators(schema, indents) {
  let doc = "";
  doc += descriptionText(schema.description, indents);
  doc += validatorText(schema.validators, indents);
  doc += arrayValidatorText(schema.arrayElements, indents);
  return doc;
}

function generateArrayOfObjectsDocFromSchema(
  schemaWithArrayElementsKey,
  keyPath
) {
  const arrayElements = schemaWithArrayElementsKey.arrayElements;
  const defaultArray = schemaWithArrayElementsKey.default;
  const outerIndents = "  ".repeat(1 + keyPath.length);
  const indents = "  ".repeat(2 + keyPath.length);
  let doc = "\n" + outerIndents + "{";
  const keys = Object.keys(arrayElements);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!specialKeys.includes(key) && isOrdinaryObject(arrayElements)) {
      const thisKeyPath = keyPath.concat([key]);
      const separator = i > 0 ? "," : "";
      const startStr = "\n" + indents;
      if (isArrayOfObjectsSchema(arrayElements[key])) {
        doc += startStr + `"${key}": [`;
        doc += generateArrayOfObjectsDocFromSchema(arrayElements[key], keyPath);
        doc += startStr + "]" + separator;
      } else {
        doc += startStr + `"${key}"`;
        doc += defaultArray[0] ? ": " + stringify(defaultArray[0][key]) : "";
        doc += i < keys.length - 1 ? "," : "";
        doc += "  // ";
        doc += arrayElements[key].hasOwnProperty("default")
          ? "default: " + arrayElements[key].default
          : "required";
      }
      doc += descriptionText(arrayElements[key].description, indents);
      doc += validatorText(arrayElements[key].validators, indents);
      doc += arrayValidatorText(arrayElements[key].arrayElements, indents);
    }
  }
  doc += "\n" + outerIndents + "}";
  if (defaultArray.length > 1) {
    const indents = "  ".repeat(1 + keyPath.length);
    doc +=
      ",\n" +
      indents +
      defaultArray
        .slice(1)
        .map((e) => stringify(e))
        .reduce((result, value, i) => result + (i > 0 ? ",\n" : "\n") + value);
  }
  return doc;
}

function isLeaf(schema) {
  return Object.keys(schema).every((k) => specialKeys.includes(k));
}

function arrayValidatorText(arrayElements, indents) {
  return arrayElements
    ? validatorText(arrayElements.validators, indents).replace(
        /\/\//g,
        "// Each element"
      )
    : "";
}

function isArrayOfObjectsSchema(schema) {
  return (
    schema.arrayElements &&
    !Object.keys(schema.arrayElements).every((k) => specialKeys.includes(k))
  );
}

function stringify(obj) {
  return JSON.stringify(obj).replace(/,/g, ", ").replace(/:/g, ": ");
}

function descriptionText(description, indents) {
  return description ? "\n  " + indents + "// " + description : "";
}

function validatorText(validators, indents) {
  if (!validators) {
    return "";
  }
  for (let v of validators) {
    if (!v) {
      console.warn(
        "Schema uses an unknown validator. Check that you are using the latest version of @openmrs/esm-cli."
      );
    }
  }
  const validatorMessages = validators.filter((v) => v).map((v) => v()); // all validators should fail for undefined
  return "\n  " + indents + "// " + validatorMessages.join(". ") + ".";
}

function appendOrReplaceDocstring(outfile, docString) {
  const inputString = fs.readFileSync(outfile, "utf8");
  const outputString = updateReadmeString(inputString, docString);
  fs.writeFileSync(outfile, outputString);
}

function updateReadmeString(readme, docString) {
  const indicatorComment = "<!-- GENERATED BY OPENMRS CONFIG CLI -->";
  const indicatorClose = "<!-- END OF GENERATED -->";
  const regexp = new RegExp(indicatorComment + "[\\s\\S]*" + indicatorClose);
  const newContent =
    indicatorComment + "\n" + docString + "\n" + indicatorClose;
  if (readme.match(regexp)) {
    readme = readme.replace(regexp, newContent);
  } else {
    const header = "\n\n## Configuration\n";
    readme += header + newContent;
  }
  return readme;
}

function isOrdinaryObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}
