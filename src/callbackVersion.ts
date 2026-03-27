'use strict';
import { IncomingMessage } from 'http';
import * as https from 'https'; // safer import

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

interface CallbackError {
  message: string;
  source: string;
  statusCode?: number;
}

type Callback<T> = (error: CallbackError | null, data?: T) => void;

function getJsonWithCallback<T>(url: string, callback: Callback<T>): void {
  let called = false;

  function done(error: CallbackError | null, data?: T) {
    if (called) return;
    called = true;
    callback(error, data);
  }

  const req = https.get(url, (res: IncomingMessage) => {
    const { statusCode } = res;
    let rawData = '';

    res.on('data', (chunk: Buffer) => {
      rawData += chunk;
    });

    res.on('end', () => {
      if (!statusCode || statusCode < 200 || statusCode >= 300) {
        return done({
          source: url,
          message: `HTTP ${statusCode}: ${rawData.slice(0, 200)}`,
          statusCode,
        });
      }
      try {
        const parsed: T = JSON.parse(rawData);
        done(null, parsed);
      } catch (e: any) {
        done({ source: url, message: `Invalid JSON: ${e.message}` });
      }
    });
  });

  req.on('error', (e: Error) => {
    done({ source: url, message: `Network error: ${e.message}` });
  });

  req.setTimeout(15000, () => {
    done({ source: url, message: `Request timed out after 15 seconds` });
    req.destroy();
  });
}

console.log('Weather and news');

getJsonWithCallback<Weather>(weatherURL, (wErr, weather) => {
  if (wErr) {
    console.error('Weather fetch failed', wErr);
    return;
  }

  const temperature = weather?.hourly?.temperature_2m?.[0] ?? 'unknown';
  console.log(`Weather temperature (Pretoria): ${temperature}°C`);

  getJsonWithCallback<NewsResponse>(newsURL, (nErr, news) => {
    if (nErr) {
      console.error('News fetch failed', nErr);
      return;
    }

    const list = news?.posts ?? [];
    console.log('Top Headlines');
    list.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
    });

    console.log(`Done (callbacks).`);
  });
});
