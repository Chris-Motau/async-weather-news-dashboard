'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
const lat = -25.7449;
const long = 28.1878;
const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`;
const newsURL = `https://dummyjson.com/posts`;
function getJsonWithPromise(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const { statusCode } = res;
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                if (!statusCode || statusCode < 200 || statusCode >= 300) {
                    return reject(new Error(`HTTP ${statusCode}: ${rawData.slice(0, 200)}`));
                }
                try {
                    const parsed = JSON.parse(rawData);
                    resolve(parsed);
                }
                catch (e) {
                    reject(new Error(`Invalid JSON: ${e.message}`));
                }
            });
        });
        req.on('error', (e) => {
            reject(new Error(`Network error: ${e.message}`));
        });
        req.setTimeout(15000, () => {
            reject(new Error('Request timed out after 15 seconds'));
            req.destroy();
        });
    });
}
console.log('Weather and news (Promises)');
getJsonWithPromise(weatherURL)
    .then((weather) => {
    const temperature = weather?.hourly?.temperature_2m?.[0] ?? 'unknown';
    console.log(`Weather temperature (Pretoria): ${temperature}°C`);
    return getJsonWithPromise(newsURL);
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
    getJsonWithPromise(weatherURL),
    getJsonWithPromise(newsURL),
]).then(([weather, news]) => {
    console.log('Weather temperature:', weather?.hourly?.temperature_2m?.[0]);
});
Promise.race([
    getJsonWithPromise(weatherURL),
    getJsonWithPromise(newsURL),
]).then((fastest) => {
    console.log('\nPromise.race result (first response arrived):', fastest);
});
