import * as fs from "fs";
import * as path from "path";
const yaml = require("js-yaml");
const glob = require("glob");

interface TestPattern {
  title: string;
  src: string;
  expected?: any;
  error?: string;
}

export default
function loadPatterns(): TestPattern[] {
  const yamlGlob = path.join(__dirname, "../../../src/test/patterns/**/*.yml");
  const yamlPaths: string[] = glob.sync(yamlGlob);
  return yamlPaths
    .map(path => yaml.safeLoad(fs.readFileSync(path, "utf8")))
    .reduce((x, y) => x.concat(y));
}
