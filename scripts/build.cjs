/* scripts/build.cjs (flags + vitals) */
const fs = require("fs");
const path = require("path");
const { parse } = require("yaml");

const ROOT = process.cwd();
const paths = {
  site: path.join(ROOT, "config", "site.yaml"),
  copy: path.join(ROOT, "config", "copy", "pt-BR.yaml"),
  flags: path.join(ROOT, "config", "flags.yaml"),
  out:  path.join(ROOT, "public", "index.html"),
  snap: path.join(ROOT, "docs", "last-good.json"),
};

function readYaml(p){ return parse(fs.readFileSync(p, "utf8")); }
function ensurePublic(){ const p=path.join(ROOT,"public"); if(!fs.existsSync(p)) fs.mkdirSync(p); }
function writeSnapshot(data){ fs.writeFileSync(paths.snap, JSON.stringify(data,null,2)); }
function readSnapshot(){ return fs.existsSync(paths.snap) ? JSON.parse(fs.readFileSync(paths.snap,"utf8")) : null; }

function renderHTML(data) {
  const { site, seo, copy, flags } = data;
  const title = site?.title || "Synapse B2B";
  const desc  = seo?.description || "";
  const url   = site?.url || "";
  const ogImg = seo?.image || "/og-image.png";
  const twitter = seo?.twitter || "";
  const hero = copy?.hero || {};
  const proof = copy?.proof?.kpis || [];
  const jsonLd = {"@context":"https://schema.org","@type":"Organization","name":site?.brand||"Synapse B2B","url":url,"logo":ogImg};

  const motion = (flags?.motionIntensity ?? "sutil").toLowerCase();
  const showHero = !!(flags?.features?.hero ?? true);
  const showFooter = !!(flags?.features?.footer ?? true);

  const vitalsScript = `
  <script>
  (function(){
    function log(name, value){ try{ console.log("[WEB-VITAL]", name, value); }catch(e){} }
    if("PerformanceObserver" in window){
      try{
        // LCP
        new PerformanceObserver((list)=>{ const e=list.getEntries().pop(); if(e) log("LCP", Math.round(e.startTime)); })
          .observe({type:"largest-contentful-paint", buffered:true});
        // CLS
        let cls=0;
        new PerformanceObserver((list)=>{ for(const e of list.getEntries()){ if(!e.hadRecentInput){ cls += e.value; } } })
          .observe({type:"layout-shift", buffered:true});
        addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden"){ log("CLS", +cls.toFixed(3)); } });
        // INP (interações)
        try{
          new PerformanceObserver((list)=>{ const e=list.getEntries().pop(); if(e && e.name==="interaction"){ log("INP", Math.round(e.duration)); } })
            .observe({type:"event", buffered:true});
        }catch(_){}
      }catch(_){}
    }
  })();
  </script>`.trim();

  const heroSection = !showHero ? "" : `
      <p class="eyebrow">${hero.eyebrow||""}</p>
      <h1>${hero.headline||""}</h1>
      <p class="sub">${hero.subhead||""}</p>
      <div class="cta">
        <a class="btn primary" href="${hero?.primaryCta?.href||"#"}">${hero?.primaryCta?.label||"Começar"}</a>
        <a class="btn" href="${hero?.secondaryCta?.href||"#"}">${hero?.secondaryCta?.label||"Saiba mais"}</a>
      </div>`;

  const footerSection = !showFooter ? "" : `
    <footer class="muted">
      <span>© ${new Date().getFullYear()} ${site?.brand||"Synapse B2B"}</span>
      <div>${((site?.layout?.footer?.links)||[]).map(l=>`<a href="${l.href}">${l.label}</a>`).join(" · ")}</div>
    </footer>`;

  return `<!doctype html>
<html lang="${site?.lang||"pt-BR"}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title><meta name="description" content="${desc}">
  <meta name="synapse-motion" content="${motion}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website"><meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}"><meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImg}"><meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${twitter}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  ${vitalsScript}
  <style>
    :root{--bg:#0f172a;--fg:#e5e7eb;--fg-dim:#94a3b8;--acc:#22d3ee}
    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,Segoe UI,Roboto,Inter}
    .wrap{max-width:1100px;margin:0 auto;padding:40px 20px}
    header,footer{display:flex;justify-content:space-between;align-items:center;gap:16px}
    nav a{color:var(--fg-dim);text-decoration:none;margin:0 10px}
    .eyebrow{color:var(--acc);font-weight:600;text-transform:uppercase;letter-spacing:.1em}
    h1{font-size:clamp(28px,4vw,48px);margin:.25em 0 .4em}
    .sub{color:var(--fg-dim);max-width:60ch}
    .cta{display:flex;gap:12px;margin-top:20px}
    .btn{padding:12px 16px;border-radius:12px;border:1px solid #334155;color:var(--fg);text-decoration:none;transition:transform .18s ease}
    .btn.primary{background:linear-gradient(90deg,#22d3ee33,#22d3ee11);border-color:#22d3ee55}
    .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:28px}
    .card{border:1px solid #334155;border-radius:14px;padding:16px;background:rgba(15,23,42,.4)}
    .muted{color:var(--fg-dim)}
    footer{margin-top:48px;padding-top:16px;border-top:1px solid #1f2937}
    a{color:var(--fg)}
    /* Motion intensities */
    body[data-motion="sutil"] .btn:hover{ transform: translateY(-1px); }
    body[data-motion="vivo"] .btn:hover{ transform: translateY(-2px) scale(1.01); }
    body[data-motion="desativado"] .btn{ transition:none }
    body[data-motion="desativado"] .btn:hover{ transform:none }
  </style>
</head>
<body data-motion="${motion}">
  <div class="wrap">
    <header>
      <strong>${site?.brand || "Synapse B2B"}</strong>
      <nav>${(site?.navigation||[]).map(i=>`<a href="${i.href}">${i.label}</a>`).join("")}</nav>
    </header>
    <main>
      ${heroSection}
      <section style="margin-top:32px">
        <div class="kpis">
          ${proof.map(k=>`<div class="card"><strong>${k.label}</strong><div class="muted">${k.desc||""}</div></div>`).join("")}
        </div>
      </section>
    </main>
    ${footerSection}
  </div>
</body>
</html>`;
}

(function main(){
  try {
    const site = readYaml(paths.site);
    const copy = readYaml(paths.copy);
    const flags = readYaml(paths.flags);
    const data = { site: site.site, seo: site.seo, copy, flags };
    ensurePublic();
    fs.writeFileSync(paths.out, renderHTML(data));
    writeSnapshot(data);
    console.log("✅ Build OK → public/index.html + snapshot atualizado");
    process.exit(0);
  } catch (e) {
    console.error("⚠️ Erro no build YAML:", e.message);
    const snap = readSnapshot();
    if (snap) {
      console.log("↩️ Usando snapshot docs/last-good.json (fallback)");
      ensurePublic();
      fs.writeFileSync(paths.out, renderHTML(snap));
      process.exit(0);
    } else {
      console.error("❌ Sem snapshot disponível. Abortando.");
      process.exit(1);
    }
  }
})();
