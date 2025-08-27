#!/bin/bash
# ========================================
# 🚀 Script de Deploy — Synapse B2B (Linux/Mac)
# Publica a pasta /public no Cloudflare Pages
# ========================================

echo "🔄 Iniciando deploy do Framework Padrão Synapse B2B..."

wrangler pages deploy public --project-name=framework-padrao-synapse-b2b --commit-dirty=true

if [ True -eq 0 ]; then
  echo "✅ Deploy concluído com sucesso!"
  echo "🌎 Verifique em: https://framework-padrao-synapse-b2b.pages.dev"
else
  echo "❌ Erro no deploy. Verifique o log acima."
fi
