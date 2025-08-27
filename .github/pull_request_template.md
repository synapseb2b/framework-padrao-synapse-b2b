@'
## Objetivo
- [ ] Descreva o que muda e por quê.

## Checklist de Qualidade (merge só com tudo OK)
- [ ] A11y AA (focus visível, ordem de tab, contraste)
- [ ] Lighthouse **mobile ≥90** (Perf/Best/SEO)
- [ ] Budgets: **≤180KB** home; **≤40KB** por bloco
- [ ] `prefers-reduced-motion` respeitado
- [ ] Tests passaram
- [ ] Sem segredos em código/commits

## Troubleshooting
- LHCI <90: reduzir imagens, lazy-load deps, dynamic import
- Axe falhou: checar roles/aria, foco, contraste
- Budgets: quebrar seção pesada, remover libs duplicadas
'@ | Set-Content .github\pull_request_template.md -Encoding UTF8
