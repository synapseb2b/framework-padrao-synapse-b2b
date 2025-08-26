import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => yaml.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));

const site = read("config/site.yaml");
const copy = read("config/copy/pt-BR.yaml");

const snapshot = {
  generatedAt: new Date().toISOString(),
  site,
  copy,
  version: 1,
};

fs.writeFileSync(path.join(__dirname, "..", "docs", "last-good.json"), JSON.stringify(snapshot, null, 2));
console.log("✔ last-good.json gerado em docs/last-good.json");
