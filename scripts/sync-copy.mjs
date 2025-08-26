import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COPY_PATH = path.join(__dirname, "..", "config", "copy", "pt-BR.yaml");

function csvToObject(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const [k, ...rest] = line.split(",");
    const v = rest.join(",").trim();
    if (!k || v === undefined) continue;
    // suporta hierarquia com dots: hero.title -> { hero: { title: "..." } }
    const parts = k.trim().split(".");
    let cur = out;
    while (parts.length > 1) {
      const p = parts.shift();
      cur[p] = cur[p] || {};
      cur = cur[p];
    }
    cur[parts[0]] = v.replace(/^"(.*)"$/,"$1"); // remove aspas se vierem
  }
  return out;
}

function deepMerge(a, b) {
  const out = structuredClone(a);
  const walk = (t, s) => {
    for (const k of Object.keys(s)) {
      if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) {
        t[k] = t[k] || {};
        walk(t[k], s[k]);
      } else {
        t[k] = s[k];
      }
    }
  };
  walk(out, b);
  return out;
}

async function main() {
  const url = process.env.SHEETS_CSV_URL;
  if (!url) throw new Error("SHEETS_CSV_URL não definido");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar CSV: ${res.status}`);
  const csv = await res.text();

  const patch = csvToObject(csv);
  const current = yaml.parse(fs.readFileSync(COPY_PATH, "utf8"));
  const updated = deepMerge(current, patch);

  const curStr = yaml.stringify(current);
  const updStr = yaml.stringify(updated);

  if (curStr === updStr) {
    console.log("Nenhuma mudança de copy.");
    return;
  }
  fs.writeFileSync(COPY_PATH, updStr);
  console.log("Copy atualizada a partir do Sheets.");
}

main().catch(err => { console.error(err); process.exit(1); });
