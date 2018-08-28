"use strict";
exports.__esModule = true;
var Gdax = require("gdax");
var rsi;
var cci;
var macd;
var candle = { open: 0.01, high: 0.01, low: 0.01, close: 0.01, timestamp: null };
var PRODUCT = 'BTC-USD';
var PERIODRSI = 14;
var PERIODCCI = 20;
var MACDFAST = 15;
var MACDSLOW = 30;
var MACDSIGNAL = 8;
var GRANULARITY = 300;
var MILLIS5MIN = 5 * 60 * 1000;
var publicClient = new Gdax.PublicClient();
var now = new Date();
var dataMoment = Math.floor(now.getTime() / MILLIS5MIN) * MILLIS5MIN;
// console.log(dataMoment);
var open = [];
var close = [];
var high = [];
var low = [];
var end = 2;
var cuim = [];
//let i: number = 1;
for (var i = 1; 1 <= end; i++) {
    // console.log(dataMoment - ((i *MILLIS5MIN * 299) + MILLIS5MIN));
    // console.log( dataMoment - ((i-1) *MILLIS5MIN * 300));
    //setTimeout( function() {
    publicClient.getProductHistoricRates(PRODUCT, { granularity: GRANULARITY,
        start: new Date(dataMoment - ((i * MILLIS5MIN * 299) + MILLIS5MIN)),
        end: new Date(dataMoment - ((i - 1) * MILLIS5MIN * 300))
    }, function (error, repsonse, data) {
        if (error) {
            console.log(error);
            return;
        }
        // for(let j = 0; j < data.length; i++) {
        //     open.push(data[j][3]);
        //     high.push(data[j][2]);
        //     low.push(data[j][1]);
        //     close.push(data[j][4]);
        // }
        //cuim.push(data);
        console.log(data[0][0]);
        console.log(data[data.length - 1][0]);
        // if(i === end) {
        //     //console.log(cuim.length);
        //     rsi = new RSI( {values: close, period: PERIODRSI} );
        //     cci = new CCI( {high: high, low: low, close: close, period: PERIODCCI} );
        //     let inputMACD = {   values: close, 
        //                         fastPeriod: MACDFAST, 
        //                         slowPeriod: MACDSLOW, 
        //                         signalPeriod: MACDSIGNAL, 
        //                         SimpleMAOscillator: false,
        //                         SimpleMASignal: false
        //                     };
        //     macd = new MACD( inputMACD);
        //     rsi.result = rsi.result.slice(22);
        //     macd.result = macd.result.slice(7);
        //     cci.result = cci.result.slice(17);
        //     //console.log("Counts:    " + rsi.result.length +", " + cci.result.length +", " + macd.result.length);
        // }
    }); //}, i*5000);    
}
