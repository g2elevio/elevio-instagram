# Narração no PC com a RTX 3060

A voz da Elevio é gerada **sempre** no PC Windows com a RTX 3060, no VoiceStudio, com o motor **VoxCPM2** (licença comercial) e o perfil **"Elevio - locutor oficial"**. O MacBook (M2, 8 GB) não roda o VoxCPM2 bem.

## O que precisa estar pronto no PC
- VoiceStudio aberto (a API local fica em `http://127.0.0.1:3900`).
- O PC conectado à sessão do Claude (acesso remoto ao computador), com a pasta `Downloads` liberada.

## Como o Claude gera a narração
O texto narrado são as `fala` de todas as cenas, juntas numa passada só, com "Elevio" escrito "Eleví-o" (`roteiro.mjs`).

**Caminho A (padrão): pela sessão do Claude, sem instalar nada no PC.**
1. O Claude grava o roteiro em `Downloads\elevio-narracao\<pasta>.txt` no PC.
2. Roda no PC (curl já vem no Windows):
   ```
   curl -s http://127.0.0.1:3900/profiles
   curl -s -X POST http://127.0.0.1:3900/generate -F "text=<roteiro.txt" -F engine=voxcpm2 -F profile_id=<ID> -F max_chunk_chars=0 -o narracao.wav
   ```
3. Traz o `narracao.wav` para o repositório, em `posts/<pasta>/`, e roda `node reel.mjs posts/<pasta>`.

**Caminho B: com o repositório clonado no PC (Node 22).**
```
set VOICESTUDIO_PERFIL=<ID>
node narrar.mjs --conferir
node narrar.mjs posts/<pasta>
```

## Regras
- Sempre `engine=voxcpm2`. Nunca OmniVoice (padrão do app, não comercial) nem XTTS.
- Roteiro inteiro numa geração (`max_chunk_chars=0`): o VoxCPM2 pode mudar o locutor entre gerações.
- O id do perfil "Elevio - locutor oficial" começa com `9c8ddde2` (conferir com `/profiles` na primeira vez).
- Sem `narracao.wav` na pasta, o `publicar.mjs` se recusa a publicar o reel.
