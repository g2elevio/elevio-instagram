# Cadência (a partir de 09/11/2026)

**Um post a cada dois dias, alternando carrossel e reel.** Conta pequena: constância vale mais que volume, e o ritmo cabe no tempo de revisão e no PC da narração.

| Dia | Formato | Hora | Pilar |
| --- | --- | --- | --- |
| Dia 1 | Carrossel | 12h | dor ou educação |
| Dia 3 | Reel | 19h | demonstração ou bastidores |
| Dia 5 | Carrossel | 12h | educação ou bastidores |
| Dia 7 | Reel | 19h | dor ou demonstração |

A sequência continua sem parar no fim de semana (ex.: 09/11 carrossel, 11/11 reel, 13/11 carrossel...). Como a semana tem 7 dias, o formato de cada dia da semana muda de uma semana para a outra.

## Estoque (`estoque.yaml`)
- **Carrosséis** são produzidos antes, em lote, e ficam prontos no estoque (meta: 4 ou mais além dos já agendados).
- **Reels** ficam com roteiro, legenda e prévia muda prontos, na fila de narração. A voz é feita no PC com a RTX 3060 **quando der**, em lote (`docs/voz-no-pc.md`).
- Todo reel no calendário tem um **carrossel de reserva** (`reserva:`). Se chegar o horário e o reel ainda não tiver `narracao.wav`, o `publicar.mjs` publica a reserva no lugar e o reel volta para a fila. Assim o ritmo não para se o PC não for ligado.

## Regras
- Stories saíram da cadência por enquanto (só manuais, quando houver algo para mostrar).
- Rodízio de pilares do plano: dor 30%, demonstração 25%, educação 20%, bastidores 15%, oferta 10% (sem oferta com prazo até os sócios definirem uma).
- Reels de 15 a 30 s, gancho nos 2 primeiros segundos. Carrosséis de 5 a 8 slides.
- O calendário cobre duas semanas e é aprovado de uma vez no PR.
