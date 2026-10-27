// Gera o vídeo de um reel a partir do conteudo.json (formato "reel").
// Uso: node reel.mjs posts/<pasta-do-reel>
// Com narracao.wav (ou .mp3) na pasta, as cenas acompanham a voz e o áudio entra no vídeo.
// Sem narração, sai uma prévia muda com tempo estimado pela quantidade de texto.
// Saída: reel.mp4 e capa-previa.jpg na pasta do post.
import { createRequire } from 'module';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { falas } from './roteiro.mjs';

// require (e não import) para achar o Playwright instalado globalmente.
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = dirname(fileURLToPath(import.meta.url));
const pasta = resolve(process.argv[2] ?? '');
const dados = JSON.parse(readFileSync(`${pasta}/conteudo.json`, 'utf8'));
if (dados.formato !== 'reel') throw new Error('conteudo.json não é de reel (formato: "reel").');

const FPS = 30;
const CAUDA = 1.2; // segundos no fim, com a última cena parada
const narracao = ['narracao.wav', 'narracao.mp3'].map(a => join(pasta, a)).find(existsSync);

const duracaoAudio = arq => parseFloat(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).toString());

// Cada cena dura proporcionalmente ao tamanho da sua fala (mínimo 1,5 s), salvo "duracao" no JSON.
const textos = falas(dados);
const pesos = textos.map(f => Math.max(f.length, 20));
const falado = narracao ? duracaoAudio(narracao) : pesos.reduce((a, b) => a + b, 0) / 14;
const soma = pesos.reduce((a, b) => a + b, 0);
const tempos = dados.cenas.map((c, i) => c.duracao ?? Math.max(1.5, falado * pesos[i] / soma));
tempos[tempos.length - 1] += CAUDA;
const total = tempos.reduce((a, b) => a + b, 0);
if (!narracao) console.warn('Sem narração na pasta: gerando prévia muda (tempo estimado).');

const quadros = join(tmpdir(), `reel-${process.pid}`);
mkdirSync(quadros, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`file://${raiz}/templates/reel.html`);
await page.evaluate(([d, t]) => window.montar(d, t), [dados, tempos]);
await page.evaluate(() => document.fonts.ready);
if (!await page.evaluate(() => document.fonts.check('800 40px Manrope')))
  console.warn('Aviso: fonte Manrope não carregou, conferir a rede antes de publicar.');

const n = Math.ceil(total * FPS);
for (let i = 0; i < n; i++) {
  await page.evaluate(t => window.render(t), i / FPS);
  await page.screenshot({ path: join(quadros, `${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
}
// Capa para revisão: o gancho já montado.
await page.evaluate(t => window.render(t), Math.min(tempos[0] - 0.3, 1.5));
await page.screenshot({ path: join(pasta, 'capa-previa.jpg'), type: 'jpeg', quality: 90 });
await browser.close();

// H.264 + AAC, o formato que o Instagram aceita para reels.
const trilha = dados.trilha ? resolve(raiz, dados.trilha) : null;
const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(quadros, '%05d.jpg')];
if (narracao) args.push('-i', narracao);
if (trilha) args.push('-stream_loop', '-1', '-i', trilha);
if (narracao && trilha) {
  args.push('-filter_complex', '[2:a]volume=0.12[t];[1:a][t]amix=inputs=2:duration=first:normalize=0[a]', '-map', '0:v', '-map', '[a]');
} else if (narracao || trilha) {
  args.push('-map', '0:v', '-map', '1:a');
}
args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-t', String(total), '-movflags', '+faststart', join(pasta, 'reel.mp4'));
execFileSync('ffmpeg', args, { stdio: 'inherit' });
rmSync(quadros, { recursive: true, force: true });
console.log(`reel.mp4 (${total.toFixed(1)} s${narracao ? ', com narração' : ', prévia muda'}) em ${pasta}`);
