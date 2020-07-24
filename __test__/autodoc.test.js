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
    console.log(result);
    expect(result).toMatch(
`"@openmrs/esm-robots": {
  "robots": [
    // a list of the robots that will be operating on your ship
    // at least one robot is required
    {
      "name": "R2-D2",  // required
        // the robot's full name
        // robots must have numbers in their names
      "homeworld": "Naboo"  // default: null
        // the planet of origin, if known
        // must be a string
      },
      { "name": "C-3PO", "homeworld": "Tatooine" }
  ],
  "hologram": {
    "color": true
      // whether the hologram supports color display
  },
  "virtualProvider": {
    // the care provider to be projected into the clinic
    "name": {
      "given": ["Qui", "Gon"]
        // any given names
        // each element must be a string
    }
  }
}`
    );
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
    const expectedFoo = new RegExp(initialReadme + "[\\s\\S]*" + "foo.*tsx");
    expect(result).toMatch(expectedFoo);

    // we modify the config schema a little bit
    execSync('sed -i "s/foo/doof/" ' + fixture);
    try {
      execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
        encoding: "utf-8",
      });
      const result = fs.readFileSync(readmePath, "utf-8");
      const expectedBar = new RegExp(initialReadme + "[\\s\\S]*" + "doof.*tsx");
      expect(result).toMatch(expectedBar);
      expect(result).not.toMatch(expectedFoo);
    } finally {
      // we change it back
      execSync('sed -i "s/doof/foo/" ' + fixture);
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
