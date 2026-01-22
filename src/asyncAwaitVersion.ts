'use strict';
import * as https from 'https';
import { IncomingMessage } from 'http';

const lat = -25.7449;
const long = 28.1878;

const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`;
const newsURL = `https://dummyjson.com/posts`;

interface WeatherSS {
  hourly?: {
    temperature_2m?: number[];
  };
}

interface News {
  title: string;
}

interface NewsResponse {
  posts: News[];
}

function getJsonAsync<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res: IncomingMessage) => {
      const { statusCode } = res;
      let rawData = '';

      res.on('data', (chunk: Buffer) => {
        rawData += chunk;
      });

      res.on('end', () => {
        if (!statusCode || statusCode < 200 || statusCode >= 300) {
          return reject(new Error(`HTTP ${statusCode}: ${rawData.slice(0, 200)}`));
        }
        try {
          const parsed: T = JSON.parse(rawData);
          resolve(parsed);
        } catch (e: any) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e: Error) => {
      reject(new Error(`Network error: ${e.message}`));
    });

    req.setTimeout(15000, () => {
      reject(new Error('Request timed out after 15 seconds'));
      req.destroy();
    });
  });
}

console.log('Weather and news (Async/Await)');

async function main() {
  try {
    const weather = await getJsonAsync<Weather>(weatherURL);
    const temperature = weather?.hourly?.temperature_2m?.[0] ?? 'unknown';
    console.log(`Weather temperature (Pretoria): ${temperature}°C`);

    const news = await getJsonAsync<NewsResponse>(newsURL);
    const list = news?.posts ?? [];
    console.log('Top Headlines');
    list.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
    });

    console.log('Done (async/await).');

    
    const [w, n] = await Promise.all([
      getJsonAsync<Weather>(weatherURL),
      getJsonAsync<NewsResponse>(newsURL),
    ]);
    console.log('Weather:', w.hourly?.temperature_2m?.[0]);
    

   
    const fastest = await Promise.race([
      getJsonAsync<Weather>(weatherURL),
      getJsonAsync<NewsResponse>(newsURL),
    ]);
    console.log('\nPromise.race result:', fastest);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();
