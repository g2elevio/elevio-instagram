# Instagram da Elevio: produção de conteúdo

Pipeline para gerar os posts da Elevio em código. Pesquisa e arquitetura no vault: `pesquisas/Automacao de postagens no Instagram.md`.

## Estrutura
- `calendario/`: um arquivo YAML por semana, com dia, hora, formato, tema, pasta e status de cada post.
- `posts/<data>-<tema>/`: um post por pasta, com `conteudo.json` (texto dos slides), `legenda.txt` e as imagens geradas (`slide-N.jpg`).
- `templates/elevio.html`: identidade visual (cores, Manrope, logo). Tipos de slide: `capa`, `item`, `comparativo`, `cta`, `story`, `story-cta`. Destaque em gradiente com `*asteriscos*`.
- `render.mjs`: gera as imagens em JPEG (formato exigido pela API do Instagram).
- `cadencia.md`: ritmo semanal proposto.
- `reel.mjs` + `templates/reel.html`: gera o `reel.mp4` (1080x1920, H.264 + AAC) a partir das cenas do `conteudo.json` (tipos `gancho`, `texto`, `lista`, `chat`, `cta`). Com `narracao.wav` na pasta, as cenas acompanham a voz; sem ela, sai uma prévia muda. Também gera `capa-previa.jpg`, usada como capa do reel.
- `narrar.mjs` + `roteiro.mjs`: pede a narração ao VoiceStudio (sempre VoxCPM2). Ver `docs/voz-no-pc.md`.
- `rotina-semanal.md`: prompt da tarefa do Claude que monta a semana toda quinta.
- `publicar.mjs`: publica pela API oficial do Instagram os itens `aprovado` + `publicacao: api` cujo horário (Brasília) já chegou, e grava no calendário o status, o id e o link.
- `.github/workflows/publicar.yml`: roda o `publicar.mjs` de hora em hora (e manualmente, com a opção "Só conferir").
- `.github/workflows/renovar-token.yml`: renova o token toda segunda (ele vale 60 dias).

## Gerar um post
```
npm install
node render.mjs posts/2026-10-28-landing-site-instagram
```
Carrossel sai em 1080×1350 e story em 1080×1920.

## Gerar um reel
```
node reel.mjs posts/2026-10-29-reel-agendamento-23h      # prévia muda
# narração no PC (docs/voz-no-pc.md) → posts/<pasta>/narracao.wav
node reel.mjs posts/2026-10-29-reel-agendamento-23h      # versão final, com voz
```
Trilha opcional: `"trilha": "audio/<arquivo>.mp3"` no `conteudo.json` (só música livre de direitos), mixada baixo sob a voz.
Reels saem com o rótulo "Informações de IA" (`is_ai_generated`), porque a narração é de IA.

## Configuração da publicação automática (uma vez só)
Em **Settings → Secrets and variables → Actions** do repositório:
1. Segredo `IG_TOKEN`: o token gerado no app da Meta (API setup with Instagram login → Generate token).
2. Segredo `GH_SECRETS_TOKEN`: token do GitHub (fine-grained, só este repositório, permissão **Secrets: Read and write**), usado para gravar o token renovado.
3. Variável `MEDIA_BASE_URL`: endereço público da raiz do repositório, de onde a Meta baixa as imagens (ex.: `https://raw.githubusercontent.com/g2elevio/elevio-instagram/main/`).
4. Em **Actions → Publicar no Instagram → Run workflow** com "Só conferir" marcado: confere o token e lista o que seria publicado.

## Fluxo
1. O Claude monta o calendário da semana e os `conteudo.json`/`legenda.txt` (status `revisar`).
2. O usuário aprova (status `aprovado`).
3. Com `publicacao: api`, o GitHub publica sozinho no horário. Com `publicacao: manual`, publicar pelo app.
4. Se a publicação falhar, o item fica com `status: erro` e a mensagem em `erro` (não tenta de novo sozinho, para não duplicar post).

## Regras
- Nunca inventar números, depoimentos ou cases. Número sem fonte fica como `pendencia` no calendário.
- Escrever "Elevio" na imagem; na narração, "Eleví-o".
- Sem emoji dentro das imagens (a fonte não garante); emoji só na legenda.
- Figurinhas de story (enquete, caixa, contagem) não passam pela API: ficam como `interativo: true` e são feitas no app.
