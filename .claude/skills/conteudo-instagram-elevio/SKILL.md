---
name: conteudo-instagram-elevio
description: Use ao criar, revisar ou agendar posts do Instagram da Elevio (carrossel, story, reel, legenda, calendário semanal, narração) no padrão visual e nas regras da marca.
---

# Conteúdo do Instagram da Elevio

Repositório `g2elevio/elevio-instagram`. Leia `README.md` e `CLAUDE.md` antes de começar.

## Fluxo
1. **Calendário:** um YAML por semana em `calendario/`, seguindo `cadencia.md`. Cada item: data, hora, formato, pilar, tema, pasta, status (`rascunho | revisar | aprovado | publicado | erro`), `publicacao` (`api | manual`) e `pendencia` quando faltar algo real. Para editar o YAML por código, use a biblioteca `yaml` (`parseDocument` + `toString({ lineWidth: 0 })`).
2. **Carrossel e story:** `posts/<AAAA-MM-DD>-<tema>/conteudo.json` + `legenda.txt` → `node render.mjs posts/<pasta>` (gera `slide-N.jpg`). Tipos de slide: `capa`, `item`, `comparativo`, `cta`, `story`, `story-cta`. Destaque com `*asteriscos*`. Nunca editar o template por post.
3. **Reel:** `conteudo.json` com `"formato": "reel"` e `cenas` (`gancho`, `texto`, `lista`, `chat`, `cta`), cada uma com `fala`. Gancho nos 2 primeiros segundos, 15 a 30 s no total. `node reel.mjs posts/<pasta>` gera a prévia muda; com `narracao.wav` na pasta, gera a versão final sincronizada.
4. **Narração:** sempre no PC com a RTX 3060, VoiceStudio, motor `voxcpm2`, perfil "Elevio - locutor oficial", roteiro inteiro numa passada e "Eleví-o" no texto (feito por `roteiro.mjs`). Passo a passo: `docs/voz-no-pc.md`. Nunca OmniVoice ou XTTS. Sem o PC, deixar `pendencia` e seguir.
5. **Conferir:** abrir as imagens e quadros do vídeo (grade com ffmpeg) e checar texto cortado, sobreposição e espaço vazio.
6. **Aprovação:** tudo vai num PR com status `revisar`. Só o usuário aprova. Nada é publicado sem `status: aprovado`, e reel sem `narracao.wav` não publica.
7. **Publicação:** GitHub Actions (`publicar.yml`) de hora em hora. Reels saem com o rótulo de IA (`is_ai_generated`).

## Regras da marca
- Público: donos de pequenos negócios que atendem pelo WhatsApp. Tom próximo, direto, sem jargão. Cada peça mostra um problema concreto e termina com CTA para o diagnóstico gratuito.
- Pilares: dor 30%, demonstração 25%, educação 20%, bastidores 15%, oferta 10%.
- **Nunca inventar números, depoimentos, logos ou cases.** Número sem fonte vira `pendencia`. Preços só da nota `pesquisas/Catalogo de servicos e precos.md` do vault. Conversas de exemplo marcadas como exemplo.
- Sem rosto do usuário: tela, texto na tela e narração de IA.
- Sem emoji dentro das imagens; emoji só na legenda. Legenda com pergunta para comentários e 6 a 8 hashtags em português.
- JPEG: carrossel 1080x1350, story e reel 1080x1920. Figurinhas de story não passam pela API (`interativo: true`, manual).

## Depois
Registrar aprendizados na nota `pesquisas/Automacao de postagens no Instagram.md` do vault `g2elevio/elevio-obsidian`.
