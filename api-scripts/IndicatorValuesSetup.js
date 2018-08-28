"use strict";
exports.__esModule = true;
var technicalindicators_1 = require("technicalindicators");
var sqlite3 = require("sqlite3");
//import * as moment from 'moment';
var db = new sqlite3.Database('./test.db');
var o = new Array(1400000);
var c = new Array(1400000);
var h = new Array(1400000);
var l = new Array(1400000);
var timestamp = [];
var periodRSI = 14;
var periodCCI = 20;
var macdFast = 15;
var macdSlow = 30;
var macdSignal = 8;
var rsi;
var cci;
var macd;
var startTime = 1433116800;
var endTime = startTime + (300 * 60);
db.each("SELECT Timestamp, Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <= $dataEnd) ORDER BY Timestamp ASC;", {
    $dataStart: startTime,
    $dataEnd: endTime
}, function (err, row) {
    timestamp.push(row.Timestamp);
    c.push(row.Close);
    o.push(row.Open);
    h.push(row.High);
    l.push(row.Low);
}, function (err, row) {
    rsi = new technicalindicators_1.RSI({ values: c, period: periodRSI });
    var inputCCI = { high: h, low: l, close: c, period: periodCCI };
    //console.log(inputCCI);
    cci = new technicalindicators_1.CCI(inputCCI);
    var inputMACD = { values: c,
        fastPeriod: macdFast,
        slowPeriod: macdSlow,
        signalPeriod: macdSignal,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    macd = new technicalindicators_1.MACD(inputMACD);
    //console.log(macd.result)
    // for( let i:number = 0; i < 36; i++) {
    // 	timestamp.shift();
    // }
    // for( let i:number = 0; i < 22; i++) {
    // 	rsi.result.shift();
    // }
    // for( let i:number = 0; i < 17; i++) {
    // 	cci.result.shift();
    // } 
    // for( let i:number = 0; i < 7; i++) {
    // 	macd.result.shift();
    // } 
    var smRSI = rsi.result.slice(21);
    rsi.result = smRSI;
    // console.log(smRSI);
    // console.log( rsi.result);
    var smMACD = macd.result.slice(6);
    macd.result = smMACD;
    var smCCI = cci.result.slice(16);
    cci.result = smCCI;
    if (rsi.result.length === cci.result.length &&
        rsi.result.length === macd.result.length) { // && timestamp.length === rsi.result.length
        console.log("Success!");
        // for( let i = 0; i < rsi.result.length; i++) {
        // 	db.run("INSERT INTO IndicatorValues( Timestamp, RSI, CCI, MACD, HistogramMACD ) VALUES ($timestamp, $rsi, $cci, $macd, $histogramMACD);", {
        // 		$timestamp: timestamp[i],
        // 		$rsi: rsi.result[i],
        // 		$cci: cci.result[i],
        // 		$macd: macd.result[i].MACD,
        // 		$histogramMACD: macd.result[i].histogram
        // 	}, (err:any, row: any) => {
        // 		if(err) {
        // 			console.log(err);
        // 		}
        // 	});
        // }	
    }
    else {
        //console.log("Failed:	" + rsi.result.length + ", " + timestamp.length +", " + cci.result.length +", " + macd.result.length);
        console.log("Failed:	" + rsi.result.length + ", " + cci.result.length + ", " + macd.result.length);
    }
});
