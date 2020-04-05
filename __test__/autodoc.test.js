import { execSync } from "child_process";
import fs from "fs";
import rimraf from "rimraf";

describe("autodoc documentation", () => {
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

  it("includes the name of the key", () => {
    expect(result).toMatch(/-.*foo/);
  });

  it("includes out of the box validators", () => {
    expect(result).toMatch(/- must be a string/i);
    expect(result).toMatch(/- must be a boolean/i);
  });

  it("includes custom validators", () => {
    expect(result).toMatch(/it's ok/);
  });

  test.todo("includes 'description' key");
  test.todo("reasonable formatting for default arrays");
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
    execSync('sed -i "s/foo/bar/" ' + fixture);
    try {
      execSync(`./bin/cli.js -e ${fixture} -o ${readmePath}`, {
        encoding: "utf-8",
      });
      const result = fs.readFileSync(readmePath, "utf-8");
      const expectedBar = new RegExp(initialReadme + "[\\s\\S]*" + "bar.*tsx");
      expect(result).toMatch(expectedBar);
      expect(result).not.toMatch(expectedFoo);
    } finally {
      // we change it back
      execSync('sed -i "s/bar/foo/" ' + fixture);
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
