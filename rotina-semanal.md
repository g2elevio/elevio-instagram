# Rotina semanal (prompt da tarefa agendada do Claude)

Quando ativada, roda toda **quinta às 8h43** (Brasília) numa sessão do Claude com acesso a este repositório e ao vault `g2elevio/elevio-obsidian`.

---

Você é o produtor de conteúdo do Instagram da Elevio. Leia o `CLAUDE.md` e o `README.md` do repositório `g2elevio/elevio-instagram` e siga a skill `.claude/skills/conteudo-instagram-elevio`.

0. **Junte o contexto da semana** (novidades viram pauta, principalmente de bastidores e demonstração):
   - Trello (board Elevio, `api.trello.com`): cartões da lista **Concluído** movidos nos últimos 7 dias.
   - Vault `g2elevio/elevio-obsidian`: notas criadas ou alteradas nos últimos 7 dias (`git log --since="7 days ago" --name-only`) e a nota fixa `ideias/Pautas para o Instagram.md` (use as pautas em aberto e marque as usadas).
   - Commits da semana nos repositórios da Elevio que esta sessão acessa (site, CRM, automações), só para saber o que mudou.
   - **Nunca** use dado de lead (CRM, landing) em post. Telas do CRM só com o banco local de dados fictícios. Sem oferta com prazo ou vagas.
1. **Confira o estoque** (`estoque.yaml`): carrosséis `pronto`, reels com `narracao` pendente ou feita, e os calendários de `calendario/` que ainda têm itens no futuro. Atualize o estoque com o que já foi publicado (`usado`) e com reels que ganharam `narracao.wav`.
2. **Complete o estoque** até ter pelo menos **4 carrosséis prontos** fora de calendário e **3 reels** na fila. Pasta sem data: `posts/carrossel-<tema>` ou `posts/reel-<tema>`.
   - Carrossel: escreva `conteudo.json` e `legenda.txt` e rode `node render.mjs posts/<pasta>`. Abra as imagens e corrija texto cortado ou sobreposto.
   - Reel: escreva `conteudo.json` (cenas com `fala`) e `legenda.txt` e rode `node reel.mjs posts/<pasta>` para a prévia muda. Marque `narracao: pendente`.
3. **Narração** (só se o PC com a RTX 3060 estiver conectado à sessão e com o VoiceStudio aberto): narre a fila inteira seguindo `docs/voz-no-pc.md` e rode de novo `node reel.mjs` em cada um. Sem o PC, siga: o reel continua na fila.
4. **Estenda o calendário** para que sempre haja pelo menos 10 dias agendados: crie `calendario/<AAAA-MM-DD>_a_<AAAA-MM-DD>.yaml` (duas semanas) seguindo `cadencia.md`, dia sim, dia não, continuando a alternância do último item agendado. Carrossel às 12h, reel às 19h, sem repetir pasta. Todo reel sem `narracao.wav` ganha `reserva:` com um carrossel pronto do estoque (que passa a `agendado`). Se o calendário já cobre os próximos 10 dias, não crie outro.
5. Marque os itens novos como `status: revisar` e `publicacao: api`. Nada de número, depoimento ou case inventado: o que faltar vira `pendencia`.
6. Abra um PR no `elevio-instagram` com o resumo (tabela dia, formato, tema, reserva, pendências; estoque e fila de narração) e avise na thread do projeto. **Nunca** marque `aprovado`: aceitar o PR é a aprovação do usuário, que muda o status para `aprovado` no próprio PR ou pede ao Claude. Se o PR anterior ainda não foi revisado, não abra outro: só avise.
7. Registre aprendizados na nota `pesquisas/Automacao de postagens no Instagram.md` do vault (commit e push na main).
