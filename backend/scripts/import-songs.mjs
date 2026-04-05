const SONG_URLS = [
  'https://www.cifraclub.com.br/soda-stereo/de-musica-ligera/',
  'https://www.cifraclub.com.br/soda-stereo/persiana-americana/',
  'https://www.cifraclub.com.br/soda-stereo/cuando-pase-la-resaca/',
  'https://www.cifraclub.com.br/soda-stereo/entre-canibales/',
  'https://www.cifraclub.com.br/soda-stereo/nada-personal/',
  'https://www.cifraclub.com.br/soda-stereo/primavera-0/',
  'https://www.cifraclub.com.br/soda-stereo/juegos-de-seduccion/',
  'https://www.cifraclub.com.br/soda-stereo/te-hacen-falta-vitaminas/',
  'https://www.cifraclub.com.br/soda-stereo/disco-eterno/',
  'https://www.cifraclub.com.br/soda-stereo/profugos/',
  'https://www.cifraclub.com.br/soda-stereo/final-caja-negra/',
  'https://www.cifraclub.com.br/soda-stereo/signos/',
  'https://www.cifraclub.com.br/soda-stereo/el-cuerpo-del-delito/',
  'https://www.cifraclub.com.br/soda-stereo/lo-que-sangra-la-cupula/',
  'https://www.cifraclub.com.br/soda-stereo/danza-rotta/',
  'https://www.cifraclub.com.br/soda-stereo/animal-de-rabia/',
  'https://www.cifraclub.com.br/soda-stereo/animal-de-noche/',
  'https://www.cifraclub.com.br/soda-stereo/un-millon-de-anos-luz/',
  'https://www.cifraclub.com.br/soda-stereo/tercer-mundo/',
  'https://www.cifraclub.com.br/soda-stereo/en-la-ciudad-de-la-furia/',
  'https://www.cifraclub.com.br/soda-stereo/ella-uso-mi-cabeza-como-un-revolver/',
  'https://www.cifraclub.com.br/soda-stereo/deja-va/',
  'https://www.cifraclub.com.br/soda-stereo/hombre-al-agua/',
  'https://www.cifraclub.com.br/soda-stereo/crimen/',
  'https://www.cifraclub.com.br/soda-stereo/magica/',
  'https://www.cifraclub.com.br/soda-stereo/paseando-por-roma/',
  'https://www.cifraclub.com.br/soda-stereo/donde-dran/',
  'https://www.cifraclub.com.br/soda-stereo/adios/',
  'https://www.cifraclub.com.br/soda-stereo/remolinos/',
  'https://www.cifraclub.com.br/soda-stereo/corazon-delator/',
  'https://www.cifraclub.com.br/soda-stereo/te-para-3/',
  'https://www.cifraclub.com.br/soda-stereo/ninguna-es-especial/',
  'https://www.cifraclub.com.br/soda-stereo/no-necesito-tantos-jardines/',
  'https://www.cifraclub.com.br/soda-stereo/por-que-no-puedo-ser-del-jet-set/',
  'https://www.cifraclub.com.br/soda-stereo/la-cosa-no-es-tan-sencilla/',
  'https://www.cifraclub.com.br/soda-stereo/una-nueva-noche-caliente/',
  'https://www.cifraclub.com.br/soda-stereo/la-vida-nos-da/',
  'https://www.cifraclub.com.br/soda-stereo/sueles-dejarme-solo/',
  'https://www.cifraclub.com.br/soda-stereo/nada-es-gratis-en-la-vida/',
  'https://www.cifraclub.com.br/soda-stereo/ahi-donde-no-podemos-ir/',
  'https://www.cifraclub.com.br/legiao-urbana/sera/',
  'https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/',
  'https://www.cifraclub.com.br/legiao-urbana/eduardo-e-monica/',
  'https://www.cifraclub.com.br/legiao-urbana/pais-e-filhos/',
  'https://www.cifraclub.com.br/legiao-urbana/indios/',
  'https://www.cifraclub.com.br/legiao-urbana/que-pais-e-este/',
  'https://www.cifraclub.com.br/legiao-urbana/faroeste-caboclo/',
  'https://www.cifraclub.com.br/legiao-urbana/montecastelo/',
  'https://www.cifraclub.com.br/legiao-urbana/ainda-e-cedo/',
  'https://www.cifraclub.com.br/legiao-urbana/ha-tempos/',
  'https://www.cifraclub.com.br/legiao-urbana/giz/',
  'https://www.cifraclub.com.br/legiao-urbana/antes-das-seis/',
  'https://www.cifraclub.com.br/legiao-urbana/o-teatro-dos-vampiros/',
  'https://www.cifraclub.com.br/legiao-urbana/13-de-maio/',
  'https://www.cifraclub.com.br/legiao-urbana/vasos-e-flores/',
  'https://www.cifraclub.com.br/legiao-urbana/meninos-e-meninas/',
  'https://www.cifraclub.com.br/legiao-urbana/conexao/',
  'https://www.cifraclub.com.br/legiao-urbana/estrada/',
  'https://www.cifraclub.com.br/legiao-urbana/hoje-a-noite-nao-tem-luar/',
  'https://www.cifraclub.com.br/legiao-urbana/mais-do-mesmo/',
  'https://www.cifraclub.com.br/legiao-urbana/letras-e-musicas/',
  'https://www.cifraclub.com.br/legiao-urbana/soldados/',
  'https://www.cifraclub.com.br/legiao-urbana/uma-cancao-pro-coracao/',
  'https://www.cifraclub.com.br/legiao-urbana/ouvir-um-astro/',
  'https://www.cifraclub.com.br/legiao-urbana/o-reggae/',
  'https://www.cifraclub.com.br/legiao-urbana/serio/',
  'https://www.cifraclub.com.br/legiao-urbana/o-baile/',
  'https://www.cifraclub.com.br/legiao-urbana/por-enquanto/',
  'https://www.cifraclub.com.br/legiao-urbana/1965/',
  'https://www.cifraclub.com.br/legiao-urbana/claros-e-turbilhoes/',
  'https://www.cifraclub.com.br/legiao-urbana/o-sol-da-meia-noite/',
  'https://www.cifraclub.com.br/legiao-urbana/a-cruz-e-a-espada/',
  'https://www.cifraclub.com.br/legiao-urbana/sem-preconceito/',
  'https://www.cifraclub.com.br/legiao-urbana/musica-de-trabalho/',
  'https://www.cifraclub.com.br/legiao-urbana/cultuando-a-casa/',
  'https://www.cifraclub.com.br/legiao-urbana/brasil/',
  'https://www.cifraclub.com.br/legiao-urbana/letra-e-musica/',
  'https://www.cifraclub.com.br/cafe-tacvba/ella/',
  'https://www.cifraclub.com.br/cafe-tacvba/la-loca/',
  'https://www.cifraclub.com.br/cafe-tacvba/ingrato/',
  'https://www.cifraclub.com.br/cafe-tacvba/como-te-llamas/',
  'https://www.cifraclub.com.br/cafe-tacvba/de-verdad/',
  'https://www.cifraclub.com.br/cafe-tacvba/la-chica-banda/',
  'https://www.cifraclub.com.br/cafe-tacvba/eres/',
  'https://www.cifraclub.com.br/cafe-tacvba/4-caminos/',
  'https://www.cifraclub.com.br/cafe-tacvba/luz-de-dia/',
  'https://www.cifraclub.com.br/cafe-tacvba/un-poco-de-amor/',
  'https://www.cifraclub.com.br/cafe-tacvba/la-salud/',
  'https://www.cifraclub.com.br/cafe-tacvba/la-negra/',
  'https://www.cifraclub.com.br/cafe-tacvba/volver-a-comenzar/',
  'https://www.cifraclub.com.br/cafe-tacvba/atraves-de-ti/',
  'https://www.cifraclub.com.br/cafe-tacvba/el-ciclismo/',
  'https://www.cifraclub.com.br/cafe-tacvba/no-eres/',
  'https://www.cifraclub.com.br/cafe-tacvba/el-baile-y-el-salon/',
  'https://www.cifraclub.com.br/cafe-tacvba/segunda-mano/',
  'https://www.cifraclub.com.br/cafe-tacvba/la-fiesta-del-este/',
  'https://www.cifraclub.com.br/cafe-tacvba/eres-para-mi/',
];

async function fetchSong(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const html = await res.text();

    const meta = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/);
    let title = 'Unknown';
    let artist = 'Unknown';
    if (meta) {
      const full = meta[1].replace(/\s*[-–]\s*Cifra Club\s*$/i, '').trim();
      const parts = full.split(/\s*[-–]\s*/);
      if (parts.length >= 2) {
        title = parts[0].trim();
        artist = parts.slice(1).join(' - ').trim();
      } else {
        title = full;
      }
    }

    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (!preMatch) return null;
    let lyrics = preMatch[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    if (lyrics.length < 50) return null;
    return { title, artist, lyrics, source: 'cifraclub', source_url: url };
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('🎸 CifraClub Mass Importer - Generating SQL\n');
  let imported = 0, failed = 0;

  for (let i = 0; i < SONG_URLS.length; i++) {
    const url = SONG_URLS[i];
    console.log(`[${i + 1}/${SONG_URLS.length}] ${url}`);

    const song = await fetchSong(url);
    if (!song) {
      failed++;
      continue;
    }

    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "''");
    console.log(`INSERT INTO songs (title, artist, lyrics, source, source_url)
SELECT '${esc(song.title)}', '${esc(song.artist)}', '${esc(song.lyrics)}', '${esc(song.source)}', '${esc(song.source_url)}'
WHERE NOT EXISTS (SELECT 1 FROM songs WHERE source_url = '${esc(song.source_url)}');`);
    imported++;

    await new Promise(r => setTimeout(r, 1500));
  }

  console.error(`\n📊 Summary: ✅ ${imported} ready | ❌ ${failed} failed | Total: ${SONG_URLS.length}`);
}

main().catch(console.error);
