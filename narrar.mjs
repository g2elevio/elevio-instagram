// Pede a narração de um reel ao VoiceStudio (roda onde o VoiceStudio estiver acessível: o PC com a RTX 3060).
// Uso: node narrar.mjs posts/<pasta-do-reel>        -> grava narracao.wav na pasta
//      node narrar.mjs --conferir                   -> só lista os perfis de voz e confere a conexão
// Ambiente: VOICESTUDIO_URL (padrão http://127.0.0.1:3900), VOICESTUDIO_PERFIL (id do perfil "Elevio - locutor oficial").
import { readFileSync, writeFileSync } from 'fs';
import { textoNarracao } from './roteiro.mjs';

const URL_VS = (process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900').replace(/\/$/, '');
const PERFIL = process.env.VOICESTUDIO_PERFIL;
// Sempre VoxCPM2: é o motor com licença comercial (OmniVoice, o padrão do app, não é).
const MOTOR = 'voxcpm2';

async function perfis() {
  const r = await fetch(`${URL_VS}/profiles`).catch(() => null);
  if (!r?.ok) throw new Error(`VoiceStudio não respondeu em ${URL_VS}. O PC está ligado e o app aberto?`);
  return r.json();
}

if (process.argv.includes('--conferir')) {
  for (const p of await perfis()) console.log(`${p.id}  ${p.name}  (${p.engine ?? 'motor não informado'})`);
  process.exit(0);
}

if (!PERFIL) throw new Error('Falta VOICESTUDIO_PERFIL (rode com --conferir para ver o id do perfil "Elevio - locutor oficial").');
const pasta = process.argv[2];
const dados = JSON.parse(readFileSync(`${pasta}/conteudo.json`, 'utf8'));
const texto = textoNarracao(dados);
const perfil = (await perfis()).find(p => p.id === PERFIL || p.id.startsWith(PERFIL));
if (!perfil) throw new Error(`Perfil ${PERFIL} não existe no VoiceStudio.`);

const form = new FormData();
form.set('text', texto);
form.set('engine', MOTOR);
form.set('profile_id', perfil.id);
form.set('max_chunk_chars', '0'); // roteiro inteiro numa geração só, para não trocar o locutor
console.log(`Narrando ${texto.length} caracteres com "${perfil.name}" (${MOTOR})...`);
const r = await fetch(`${URL_VS}/generate`, { method: 'POST', body: form });
if (!r.ok || !r.headers.get('content-type')?.includes('audio')) {
  throw new Error(`VoiceStudio recusou (${r.status}): ${(await r.text()).slice(0, 300)}`);
}
writeFileSync(`${pasta}/narracao.wav`, Buffer.from(await r.arrayBuffer()));
console.log(`narracao.wav gravada em ${pasta}`);
