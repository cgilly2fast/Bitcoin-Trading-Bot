"use strict";
exports.__esModule = true;
var GDAXExchangeAPI_1 = require("gdax-trading-toolkit/build/src/exchanges/gdax/GDAXExchangeAPI");
var exchanges_1 = require("gdax-trading-toolkit/build/src/exchanges");
var sqlite3 = require("sqlite3");
var moment = require("moment");
//let fs = require('fs');
var options = {
    logger: logger,
    auth: { key: null, secret: null, passphrase: null },
    channels: ['ticker'],
    wsUrl: exchanges_1.GDAX_WS_FEED,
    apiUrl: GDAXExchangeAPI_1.GDAX_API_URL
};
var db = new sqlite3.Database('./test.db');
var gdax = new GDAXExchangeAPI_1.GDAXExchangeAPI(options);
var startTime = 1515369600;
var endTime = moment('1529001240', 'X', true);
var PRODUCT = 'BTC-USD';
//console.log( "Start Time:	" + startTime.format() + "	End Time:	" +startTime.add(300, 'm').format());
// let results:any = rates(startTime, endTime);
// console.log(results);
// let unfinished:number[] = [635,
// 636,
// 637,
// 638,
// 639,
// 640]
var candleRequestOptions = {
    gdaxProduct: PRODUCT,
    interval: '5m',
    from: new Date(startTime),
    limit: 1000,
    extra: null
};
var s = moment(((unfinished[i] * 18000) + startTime).toString(), "X", true);
//console.log(s);
gdax.loadCandles(candleRequestOptions).then(function (candle) {
    console.log("Start:		" + candle[0] + "	End:	" + candle[candle.length - 1]);
    console.log(data.length);
});
//}
