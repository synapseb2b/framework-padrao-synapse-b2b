$ErrorActionPreference = "Stop"

# Diretório real do script (independente de onde você chama)
$repo   = $PSScriptRoot
if (-not $repo) { $repo = (Get-Location).Path }

$public = Join-Path $repo 'public'
if (!(Test-Path $public)) {
  throw "Pasta 'public' não encontrada em: $public"
}

Write-Host "🔄 Deploy (PowerShell) a partir de: $repo" -ForegroundColor Cyan

Push-Location $repo
try {
  wrangler pages deploy $public --project-name=framework-padrao-synapse-b2b --commit-dirty=true
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌎 Verifique em: https://framework-padrao-synapse-b2b.pages.dev" -ForegroundColor Yellow
    exit 0
  } else {
    throw "❌ Deploy falhou com exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}
