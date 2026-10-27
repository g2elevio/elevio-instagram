# Instagram da Elevio: regras para o Claude

- Responder e escrever em **português**. Na narração, escrever "Eleví-o".
- Leia o `README.md` antes de mexer. Posts novos seguem o padrão de `posts/` e do calendário; nunca editar o template por post.
- **Nunca publicar** item que não esteja com `status: aprovado` dado pelo usuário. Publicar é ação pública: não rodar `publicar.mjs` sem `--teste` fora do GitHub Actions.
- **Nunca inventar números, depoimentos, logos ou cases.** Número sem fonte vira `pendencia` no calendário.
- Token e chaves só nos segredos do GitHub Actions, nunca no repositório, em logs ou no chat.
- Voz: sempre no PC com a RTX 3060, VoiceStudio + VoxCPM2, perfil "Elevio - locutor oficial" (`docs/voz-no-pc.md`). Nunca publicar reel sem `narracao.wav`.
- Imagens em JPEG (carrossel 1080x1350, story e reel 1080x1920). Figurinhas de story não passam pela API.
- Pesquisa e decisões: vault `g2elevio/elevio-obsidian`, nota `pesquisas/Automacao de postagens no Instagram.md`.
