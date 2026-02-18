'use strict';
import * as https from 'https';
import { IncomingMessage } from 'http';

const lat = -25.7449;
const long = 28.1878;

const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`;
const newsURL = `https://dummyjson.com/posts`;

interface Weather {
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

function getJsonWithPromise<T>(url: string): Promise<T> {
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

console.log('Weather and news (Promises)');

getJsonWithPromise<Weather>(weatherURL)
  .then((weather) => {
    const temperature = weather?.hourly?.temperature_2m?.[0] ?? 'unknown';
    console.log(`Weather temperature (Pretoria): ${temperature}°C`);
    return getJsonWithPromise<NewsResponse>(newsURL);
  })
  .then((news) => {
    const list = news?.posts ?? [];
    console.log('Top Headlines');
    list.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
    });
    console.log('Done (promises).');
  })
  .catch((err) => {
    console.error('Error:', err.message);
  });

Promise.all([
  getJsonWithPromise<Weather>(weatherURL),
  getJsonWithPromise<NewsResponse>(newsURL),
]).then(([weather, news]) => {
  console.log('Weather temperature:', weather?.hourly?.temperature_2m?.[0]);
});

Promise.race([
  getJsonWithPromise<Weather>(weatherURL),
  getJsonWithPromise<NewsResponse>(newsURL),
]).then((fastest) => {
  console.log('\nPromise.race result (first response arrived):', fastest);
});
