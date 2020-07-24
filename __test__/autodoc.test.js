import { execSync } from "child_process";
import fs from "fs";
import rimraf from "rimraf";

describe("autodoc module", () => {
  it("can be required", () => {
    require("../lib/autodoc");
  });
});

describe("autodoc executable", () => {
  const tempDir = __dirname + "/temp";
  const readmePath = tempDir + "/README.md";
  const initialReadme = "# My Module\n\nIt is so beautiful\n";

  let result;
  beforeAll(() => {
    rimraf.sync(tempDir);
    fs.mkdirSync(tempDir);
    fs.writeFileSync(readmePath, initialReadme);
    const fixture = __dirname + "/fixtures/tsx-module.tsx";
    execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
      encoding: "utf-8",
    });
    result = fs.readFileSync(readmePath, "utf-8");
  });

  it("includes the original content", () => {
    expect(result).toMatch(initialReadme);
  });

  it("matches the expected output", () => {
    expect(result).toMatch(`"@openmrs/esm-robots": {`);
    expect(result).toMatch(`"robots": [`);
    expect(result).toMatch(
      /A list of the robots that will be operating on your ship/i
    );
    expect(result).toMatch(/At least one robot is required/i);
    expect(result).toMatch(`"name": "R2-D2",  // required`);
    expect(result).toMatch(/The robot's full name/i);
    expect(result).toMatch(/Robots must have numbers in their names/i);
    expect(result).toMatch(`"homeworld": "Naboo"  // default: null`);
    expect(result).toMatch(/must be a string/i);
    expect(result).toMatch(`{"name": "C-3PO", "homeworld": "Tatooine"}`);
    const hologramLines = [
      `"hologram": {`,
      `"color": true`,
      `// Whether the hologram supports color display`,
      `},`,
    ].join("\n\\s*");
    expect(result).toMatch(new RegExp(hologramLines));
    const providerLines = [
      `"virtualProvider": {`,
      `// The care provider to be projected into the clinic`,
      `"name": {`,
      `"given": \\["Qui", "Gon"\\]`,
      `// Any given names`,
      `// Each element must be a string.`,
    ].join("\n\\s*");
    expect(result).toMatch(new RegExp(providerLines));
  });
});

describe("autodoc capabilities", () => {
  const tempDir = __dirname + "/temp";
  const readmePath = tempDir + "/README.md";
  const initialReadme = "# My Module\n\nIt is so beautiful\n";

  beforeEach(() => {
    rimraf.sync(tempDir);
    fs.mkdirSync(tempDir);
    fs.writeFileSync(readmePath, initialReadme);
  });

  it("should extract schema from a tsx module and then update that schema, and ignore css imports", () => {
    const fixture = __dirname + "/fixtures/tsx-module.tsx";
    execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
      encoding: "utf-8",
    });
    const result = fs.readFileSync(readmePath, "utf-8");
    const expectedRobots = new RegExp(
      initialReadme + "[\\s\\S]*" + '"robots": \\['
    );
    expect(result).toMatch(expectedRobots);

    // we modify the config schema a little bit
    execSync('sed -i "s/robots/androids/" ' + fixture);
    try {
      execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
        encoding: "utf-8",
      });
      const result = fs.readFileSync(readmePath, "utf-8");
      const expectedAndroids = new RegExp(
        initialReadme + "[\\s\\S]*" + '"androids": \\['
      );
      expect(result).toMatch(expectedAndroids);
      expect(result).not.toMatch(expectedRobots);
    } finally {
      // we change it back
      execSync('sed -i "s/androids/robots/" ' + fixture);
    }
  });

  it("can extract from a nodejs module", () => {
    const fixture = __dirname + "/fixtures/nodejs-module.js";
    execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
      encoding: "utf-8",
    });
    const result = fs.readFileSync(readmePath, "utf-8");
    const expectedFoo = new RegExp(initialReadme + "[\\s\\S]*" + "foo.*js");
    expect(result).toMatch(expectedFoo);
  });

  it("can extract a schema that is split across files", () => {
    const fixture = __dirname + "/fixtures/split-module.tsx";
    const dependency = "./split-out-schema";
    execSync(`./bin/cli.js -e ${fixture} -o ${readmePath} -d ${dependency}`, {
      encoding: "utf-8",
    });
    const result = fs.readFileSync(readmePath, "utf-8");
    const expectedFoo = new RegExp(initialReadme + "[\\s\\S]*" + "foo.*tsx");
    expect(result).toMatch(expectedFoo);
  });

  test.todo("can extract from an ES6 JS module");
});
