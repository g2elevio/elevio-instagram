// Gera as imagens de um post a partir do conteudo.json dele.
// Uso: node render.mjs posts/<pasta-do-post>
// Saída: slide-1.jpg, slide-2.jpg... na mesma pasta (JPEG, formato aceito pela API do Instagram).
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// require (e não import) para achar o Playwright instalado globalmente.
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = dirname(fileURLToPath(import.meta.url));
const pasta = resolve(process.argv[2] ?? '');
const dados = JSON.parse(readFileSync(`${pasta}/conteudo.json`, 'utf8'));
const altura = dados.formato === 'story' ? 1920 : 1350;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: altura } });
await page.goto(`file://${raiz}/templates/elevio.html`);
await page.evaluate(d => window.montar(d), dados);
await page.evaluate(() => document.fonts.ready);
const fonte = await page.evaluate(() => document.fonts.check('800 40px Manrope'));
if (!fonte) console.warn('Aviso: fonte Manrope não carregou, conferir a rede antes de publicar.');

const slides = await page.$$('section.s');
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: `${pasta}/slide-${i + 1}.jpg`, type: 'jpeg', quality: 92 });
}
await browser.close();
console.log(`${slides.length} imagem(ns) em ${pasta}`);
