// Texto que vai para o VoiceStudio: as falas de todas as cenas, numa passada só
// (o VoxCPM2 muda o locutor a cada geração, então nunca narrar cena por cena).
export function falas(dados) {
  return dados.cenas.map(c => String(c.fala ?? '').trim());
}

// "Elevio" escrito como se fala (tônica no "vi"), para o TTS não ler "Elévio".
export function textoNarracao(dados) {
  return falas(dados).filter(Boolean).join(' ').replace(/Elevio/g, 'Eleví-o');
}
