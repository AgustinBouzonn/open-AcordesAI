import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const BACKEND_URL = 'http://10.11.243.151:3001';

// URLs de canciones populares de CifraClub
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

interface SongData {
  title: string;
  artist: string;
  lyrics: string;
  source: string;
  source_url: string;
}

async function fetchSongWithPuppeteer(url: string): Promise<SongData | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the chords content to load
    await page.waitForSelector('pre, [data-chords], [data-sheet], .chord-content', { timeout: 10000 }).catch(() => {});

    // Extract title from meta tags or page content
    const title = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="og:title"]');
      if (meta) {
        return (meta.getAttribute('content') || '').replace(/\s*[-–]\s*Cifra Club\s*$/i, '').trim();
      }
      const h1 = document.querySelector('h1');
      return h1?.textContent?.trim() || '';
    });

    // Extract chords/lyrics
    const lyrics = await page.evaluate(() => {
      // Try pre tags with chord content
      const pres = document.querySelectorAll('pre');
      for (const pre of Array.from(pres)) {
        const text = pre.textContent?.trim() || '';
        if (text.length > 100) return text;
      }

      // Try chord content containers
      const chordContainers = document.querySelectorAll('[data-chords], [data-sheet], .chord-content, .cifra');
      for (const container of Array.from(chordContainers)) {
        const text = container.textContent?.trim() || '';
        if (text.length > 100) return text;
      }

      // Try any div with substantial text content that looks like chords
      const allDivs = document.querySelectorAll('div');
      for (const div of Array.from(allDivs)) {
        const text = div.textContent?.trim() || '';
        if (text.length > 200 && text.length < 50000) {
          // Check if it looks like chord content (has line breaks and short lines)
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 10) return text;
        }
      }

      return '';
    });

    if (!lyrics || lyrics.length < 50) {
      console.log(`  ⚠️ No lyrics found for ${title}`);
      return null;
    }

    // Parse title and artist
    let songTitle = title;
    let artist = 'Unknown';

    const parts = title.split(/\s*[-–]\s*/);
    if (parts.length >= 2) {
      songTitle = parts[0].trim();
      artist = parts.slice(1).join(' - ').trim();
    }

    return {
      title: songTitle,
      artist,
      lyrics: lyrics.trim(),
      source: 'cifraclub',
      source_url: url,
    };
  } catch (error) {
    console.error(`  ❌ Error: ${error}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

async function importSong(song: SongData): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });

    if (response.ok) {
      return true;
    }

    const error = await response.json() as Record<string, unknown>;
    const msg = (error.message as string) || '';
    if (msg.includes('duplicate') || msg.includes('unique')) {
      console.log(`  ⏭️ Already exists: ${song.title} - ${song.artist}`);
      return false;
    }

    console.error(`  ❌ Import failed: ${JSON.stringify(error)}`);
    return false;
  } catch (error) {
    console.error(`  ❌ Import error: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🎸 CifraClub Mass Importer (Puppeteer)\n');

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const total = SONG_URLS.length;

  for (let i = 0; i < SONG_URLS.length; i++) {
    const url = SONG_URLS[i];
    console.log(`\n[${i + 1}/${total}] Fetching: ${url}`);

    const song = await fetchSongWithPuppeteer(url);
    if (!song) {
      failed++;
      continue;
    }

    console.log(`  📝 ${song.title} - ${song.artist} (${song.lyrics.length} chars)`);

    const success = await importSong(song);
    if (success) {
      imported++;
      console.log(`  ✅ Imported!`);
    } else {
      skipped++;
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Imported: ${imported}`);
  console.log(`  ⏭️ Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${total}`);
}

main().catch(console.error);
