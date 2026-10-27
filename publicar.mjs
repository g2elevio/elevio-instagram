// Publica no Instagram os itens do calendário que estão aprovados e cujo horário já chegou.
// Uso: node publicar.mjs            (publica de verdade)
//      node publicar.mjs --teste    (só confere o token e mostra o que seria publicado)
// Ambiente: IG_TOKEN (segredo), MEDIA_BASE_URL (URL pública da raiz do repositório), IG_API_VERSION (opcional).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { parseDocument } from 'yaml';

const TESTE = process.argv.includes('--teste');
const VERSAO = process.env.IG_API_VERSION || 'v26.0';
const API = `https://graph.instagram.com/${VERSAO}`;
const TOKEN = process.env.IG_TOKEN;
const BASE = (process.env.MEDIA_BASE_URL || '').replace(/\/?$/, '/');
if (!TOKEN) throw new Error('Falta o segredo IG_TOKEN.');
if (!TESTE && BASE === '/') throw new Error('Falta a variável MEDIA_BASE_URL.');

async function ig(caminho, params = {}, metodo = 'GET') {
  const url = new URL(`${API}/${caminho}`);
  const corpo = new URLSearchParams({ ...params, access_token: TOKEN });
  const resp = metodo === 'GET'
    ? await fetch(`${url}?${corpo}`)
    : await fetch(url, { method: 'POST', body: corpo });
  const json = await resp.json();
  // Nunca imprimir o token: a mensagem de erro da Meta não o contém.
  if (!resp.ok || json.error) throw new Error(`${metodo} ${caminho}: ${json.error?.message ?? resp.status}`);
  return json;
}

const espera = ms => new Promise(r => setTimeout(r, ms));

// Vídeos (reel/story em vídeo) precisam terminar de processar antes de publicar.
async function aguardarContainer(id) {
  for (let i = 0; i < 60; i++) {
    const { status_code } = await ig(id, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`Contêiner ${id} terminou com ${status_code}.`);
    await espera(10_000);
  }
  throw new Error(`Contêiner ${id} não terminou de processar em 10 minutos.`);
}

function midias(item) {
  const pasta = String(item.get('pasta'));
  const arquivos = readdirSync(pasta).filter(a => /\.(jpe?g|mp4)$/i.test(a))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!arquivos.length) throw new Error(`Nenhuma imagem ou vídeo em ${pasta}.`);
  return arquivos.map(a => ({ url: `${BASE}${pasta}/${a}`, video: a.toLowerCase().endsWith('.mp4') }));
}

const legendaDe = item => {
  const arq = `${item.get('pasta')}/legenda.txt`;
  return existsSync(arq) ? readFileSync(arq, 'utf8').trim() : '';
};

async function publicar(igId, item) {
  const formato = item.get('formato');
  const lista = midias(item);
  const caption = legendaDe(item);
  // Rótulo "Informações de IA": obrigatório em vídeo/áudio realista feito com IA. Reel tem narração de IA,
  // então vem ligado por padrão; outros formatos só com "ia: true" no calendário.
  const ia = (item.get('ia') ?? formato === 'reel') ? { is_ai_generated: 'true' } : {};
  let criacao;

  if (formato === 'carrossel') {
    if (lista.length < 2 || lista.length > 20) throw new Error('Carrossel precisa de 2 a 20 itens.');
    const filhos = [];
    for (const m of lista) {
      const p = m.video ? { media_type: 'VIDEO', video_url: m.url } : { image_url: m.url };
      const { id } = await ig(`${igId}/media`, { ...p, is_carousel_item: 'true' }, 'POST');
      if (m.video) await aguardarContainer(id);
      filhos.push(id);
    }
    ({ id: criacao } = await ig(`${igId}/media`, { media_type: 'CAROUSEL', children: filhos.join(','), caption, ...ia }, 'POST'));
  } else if (formato === 'reel') {
    const video = lista.find(m => m.video);
    if (!video) throw new Error('Reel sem arquivo .mp4.');
    // Sem narracao.wav na pasta, o reel.mp4 é só a prévia muda: nunca publicar.
    if (!existsSync(`${item.get('pasta')}/narracao.wav`)) throw new Error('Reel sem narração (prévia muda).');
    const p = { media_type: 'REELS', video_url: video.url, caption, share_to_feed: 'true', ...ia };
    const capa = lista.find(m => m.url.endsWith('/capa-previa.jpg'));
    if (capa) p.cover_url = capa.url;
    ({ id: criacao } = await ig(`${igId}/media`, p, 'POST'));
  } else if (formato === 'story') {
    const m = lista[0];
    const p = m.video ? { video_url: m.url } : { image_url: m.url };
    ({ id: criacao } = await ig(`${igId}/media`, { media_type: 'STORIES', ...p, ...ia }, 'POST'));
  } else if (formato === 'imagem') {
    ({ id: criacao } = await ig(`${igId}/media`, { image_url: lista[0].url, caption, ...ia }, 'POST'));
  } else {
    throw new Error(`Formato desconhecido: ${formato}`);
  }

  await aguardarContainer(criacao);
  const { id } = await ig(`${igId}/media_publish`, { creation_id: criacao }, 'POST');
  // Já publicou: se só o link falhar, não marcar como erro (evita publicar de novo).
  const permalink = await ig(id, { fields: 'permalink' }).then(r => r.permalink, () => '');
  return { id, permalink };
}

// Horários do calendário são de Brasília (UTC-3, sem horário de verão).
const quando = item => new Date(`${item.get('data')}T${item.get('hora') ?? '12:00'}:00-03:00`);

const conta = await ig('me', { fields: 'user_id,username' });
console.log(`Conta: @${conta.username}`);
if (TESTE) {
  const limite = await ig(`${conta.user_id}/content_publishing_limit`, { fields: 'quota_usage,config' });
  console.log('Uso do limite de publicação:', JSON.stringify(limite.data?.[0] ?? limite));
}

const agora = new Date();
let falhas = 0;
for (const arq of readdirSync('calendario').filter(a => a.endsWith('.yaml'))) {
  const caminho = `calendario/${arq}`;
  const doc = parseDocument(readFileSync(caminho, 'utf8'));
  let mudou = false;
  for (const item of doc.get('itens').items) {
    if (item.get('status') !== 'aprovado' || item.get('publicacao') !== 'api' || item.get('interativo')) continue;
    if (quando(item) > agora) continue;
    const nome = `${item.get('data')} ${item.get('formato')}: ${item.get('tema')}`;
    if (TESTE) { console.log(`[teste] publicaria ${nome} (${midias(item).length} arquivo(s))`); continue; }
    try {
      const r = await publicar(conta.user_id, item);
      item.set('status', 'publicado');
      item.set('instagram_id', r.id);
      item.set('link', r.permalink);
      console.log(`Publicado ${nome}: ${r.permalink}`);
    } catch (e) {
      falhas++;
      item.set('status', 'erro');
      item.set('erro', e.message);
      console.error(`Falhou ${nome}: ${e.message}`);
    }
    mudou = true;
  }
  if (mudou) writeFileSync(caminho, doc.toString({ lineWidth: 0 }));
}
if (falhas) process.exitCode = 1;
