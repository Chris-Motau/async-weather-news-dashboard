'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = require("https");
var lat = -25.7449;
var long = 28.1878;
var weatherURL = "https://api.open-meteo.com/v1/forecast?latitude=".concat(lat, "&longitude=").concat(long, "&hourly=temperature_2m");
var newsURL = "https://dummyjson.com/posts";
function getJsonWithCallback(url, callback) {
    var called = false;
    function done(error, data) {
        if (called)
            return;
        called = true;
        callback(error, data);
    }
    var req = https_1.default.get(url, function (res) {
        var statusCode = res.statusCode;
        var rawData = '';
        res.on('data', function (chunk) {
            rawData += chunk;
        });
        res.on('end', function () {
            if (!statusCode || statusCode < 200 || statusCode >= 300) {
                return done({
                    source: url,
                    message: "HTTP ".concat(statusCode, ": ").concat(rawData.slice(0, 200)),
                    statusCode: statusCode
                });
            }
            try {
                var parsed = JSON.parse(rawData);
                done(null, parsed);
            }
            catch (e) {
                done({ source: url, message: "Invalid JSON:".concat(e.message) });
            }
        });
    });
    req.on("error", function (e) {
        done({ source: url, message: "Network error:".concat(e.message) });
    });
    req.setTimeout(15000, function () {
        done({ source: url, message: "Request Timed out after 15 seconds" });
        req.destroy();
    });
}
console.log('Weather and news');
getJsonWithCallback(weatherURL, function (wErr, Weather) {
    var _a, _b;
    if (wErr) {
        console.error('Weather fetch failed', wErr);
        return;
    }
    var temperature = (_b = (_a = Weather === null || Weather === void 0 ? void 0 : Weather.currentWeather) === null || _a === void 0 ? void 0 : _a.temperature) !== null && _b !== void 0 ? _b : 'unknown';
    console.log("Weather temperature(Pretoria): ".concat(temperature, "C"));
    getJsonWithCallback(newsURL, function (nErr, news) {
        var _a;
        if (nErr) {
            console.error('News fetch failed', wErr);
            return;
        }
        var list = (_a = news === null || news === void 0 ? void 0 : news.list) !== null && _a !== void 0 ? _a : [];
        console.log('Top Headlines');
        list.forEach(function (p, i) {
            console.log("".concat(i + 1, ". ").concat(p.title));
        });
        console.log("Done (callbacks).");
    });
});
