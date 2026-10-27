# Instagram da Elevio: produção de conteúdo

Pipeline para gerar os posts da Elevio em código. Pesquisa e arquitetura no vault: `pesquisas/Automacao de postagens no Instagram.md`.

## Estrutura
- `calendario/`: um arquivo YAML por semana, com dia, hora, formato, tema, pasta e status de cada post.
- `posts/<data>-<tema>/`: um post por pasta, com `conteudo.json` (texto dos slides), `legenda.txt` e as imagens geradas (`slide-N.jpg`).
- `templates/elevio.html`: identidade visual (cores, Manrope, logo). Tipos de slide: `capa`, `item`, `comparativo`, `cta`, `story`, `story-cta`. Destaque em gradiente com `*asteriscos*`.
- `render.mjs`: gera as imagens em JPEG (formato exigido pela API do Instagram).
- `cadencia.md`: ritmo semanal proposto.

## Gerar um post
```
node render.mjs posts/2026-10-28-landing-site-instagram
```
Carrossel sai em 1080×1350 e story em 1080×1920.

## Fluxo
1. O Claude monta o calendário da semana e os `conteudo.json`/`legenda.txt` (status `revisar`).
2. O usuário aprova (status `aprovado`).
3. Fase 1: publicar manualmente (ou pelo Meta Business Suite). Fase 2: publicação automática pela API oficial.

## Regras
- Nunca inventar números, depoimentos ou cases. Número sem fonte fica como `pendencia` no calendário.
- Escrever "Elevio" na imagem; na narração, "Eleví-o".
- Sem emoji dentro das imagens (a fonte não garante); emoji só na legenda.
- Figurinhas de story (enquete, caixa, contagem) não passam pela API: ficam como `interativo: true` e são feitas no app.
