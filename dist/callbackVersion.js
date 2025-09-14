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
const https = __importStar(require("https")); // safer import
const lat = -25.7449;
const long = 28.1878;
const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`;
const newsURL = `https://dummyjson.com/posts`;
function getJsonWithCallback(url, callback) {
    let called = false;
    function done(error, data) {
        if (called)
            return;
        called = true;
        callback(error, data);
    }
    const req = https.get(url, (res) => {
        const { statusCode } = res;
        let rawData = '';
        res.on('data', (chunk) => {
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
                const parsed = JSON.parse(rawData);
                done(null, parsed);
            }
            catch (e) {
                done({ source: url, message: `Invalid JSON: ${e.message}` });
            }
        });
    });
    req.on('error', (e) => {
        done({ source: url, message: `Network error: ${e.message}` });
    });
    req.setTimeout(15000, () => {
        done({ source: url, message: `Request timed out after 15 seconds` });
        req.destroy();
    });
}
console.log('Weather and news');
getJsonWithCallback(weatherURL, (wErr, weather) => {
    if (wErr) {
        console.error('Weather fetch failed', wErr);
        return;
    }
    const temperature = weather?.hourly?.temperature_2m?.[0] ?? 'unknown';
    console.log(`Weather temperature (Pretoria): ${temperature}°C`);
    getJsonWithCallback(newsURL, (nErr, news) => {
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
