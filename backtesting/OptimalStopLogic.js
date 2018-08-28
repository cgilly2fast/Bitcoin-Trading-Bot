"use strict";
exports.__esModule = true;
var technicalindicators_1 = require("technicalindicators");
var sqlite3 = require("sqlite3");
var moment = require("moment");
var db = new sqlite3.Database('./test.db');
var targetGain = 1.02;
var days = 17;
var stopTime = days * 24 * 3600;
var time37 = 6.25 * 24 * 3600;
var open = [];
var close = [];
var high = [];
var low = [];
var periodRSI = 14;
var periodCCI = 20;
var macdFast = 15;
var macdSlow = 30;
var macdSignal = 8;
var rsi;
var cci;
var macd;
var trade = false;
var sellPrice;
var profit = 0;
var numSells = 0;
var buyMoment = {};
var sellMoment = {};
var numStopSell = 0;
var numStopLoss = 0;
var numStopGain = 0;
var loss = [];
var equity = 1000;
var buyPrice = 0;
var totalEquityLost = 0;
var localMax = 0;
var gain = [];
var startTime = 1448928000;
var endTime = 1512604800;
db.each("SELECT Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <= $dataEnd) ORDER BY Timestamp ASC;", {
    $dataStart: startTime,
    $dataEnd: startTime + (3600 * 6)
}, function (err, row) {
    close.push(row.Close);
    open.push(row.Open);
    high.push(row.High);
    low.push(row.Low);
}, function (err, row) {
    rsi = new technicalindicators_1.RSI({ values: close, period: periodRSI });
    var inputCCI = { high: high, low: low, close: close, period: periodCCI };
    //console.log(rsi);
    cci = new technicalindicators_1.CCI(inputCCI);
    //console.log(cci);
    var inputMACD = { values: close,
        fastPeriod: macdFast,
        slowPeriod: macdSlow,
        signalPeriod: macdSignal,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    macd = new technicalindicators_1.MACD(inputMACD);
    //console.log(macd);
    db.each("SELECT Timestamp, Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <=  $dataEnd) ORDER BY Timestamp ASC;", {
        $dataStart: startTime + (3600 * 6),
        $dataEnd: endTime
    }, function (err, row) {
        //console.log(row.Low);
        var candle = { open: row.Open, high: row.High, low: row.Low, close: row.Close, timestamp: row.Timestamp };
        //console.log(candle);
        var newCCI = cci.nextValue(candle);
        //console.log(newCCI);
        var newRSI = rsi.nextValue(candle.close);
        //console.log(newRSI);
        var newMACD = macd.nextValue(candle.close);
        //console.log("new:" + newMACD.histogram);
        if (!trade) {
            var cciPrev = cci.result[cci.result.length - 1];
            var macdPrev = macd.result[macd.result.length - 1].histogram;
            //console.log("prev" + macdPrev);
            var rsiPrev = rsi.result[rsi.result.length - 1];
            //console.log("prev: " + rsiPrev);
            var strictness = 7.6;
            if ((cciPrev <= -100) && (macdPrev < 0) && (rsiPrev < 45)) {
                //console.log("TEST 1 COMPLETE");
                if ((percentChg(newCCI, cciPrev) >= strictness) && (percentChg(newRSI, rsiPrev) >= strictness) && (percentChg(newMACD.histogram, macdPrev) >= strictness)) {
                    trade = true;
                    buyPrice = candle.close;
                    sellPrice = limitBuy(candle.close);
                    buyMoment = moment.unix(candle.timestamp);
                    //console.log("Buy:	" + candle.close + "	time:	" + buyMoment);
                    //console.log("Buy:	" + candle.close + "	MCAD:	" +macdPrev + "-" + new);
                }
            }
        }
        else {
            var intBuyTime = parseInt(buyMoment.format('X'));
            if ((sellPrice < candle.high)) {
                numSells++;
                equity = (equity * sellPrice) / (buyPrice);
                sellPrice = null;
                trade = false;
                localMax = 0;
            }
            else if (((candle.timestamp - intBuyTime) <= time37) && (candle.high > localMax)) {
                localMax = candle.high;
            }
            else if (((candle.timestamp - intBuyTime) >= stopTime) ||
                (((candle.timestamp - intBuyTime) > time37) && (candle.high >= (localMax * 1.01)))) {
                numStopSell++;
                var lossEquity = (equity * candle.open) / (buyPrice);
                if (buyPrice <= candle.open) {
                    numStopGain++;
                    gain.push(percentChg(candle.open, buyPrice));
                }
                else {
                    numStopLoss++;
                    //console.log("Equity:	" + Math.round(equity) + "	Loss Equity:	" + Math.round(lossEquity));
                    totalEquityLost += (equity - lossEquity);
                    //console.log(totalEquityLost);
                    loss.push(percentChg(candle.open, buyPrice));
                }
                //console.log("Before:	" + equity + "	after:	" + lossEquity);
                equity = lossEquity;
                //console.log("Sell:	" + candle.open + "	time:	" + candle.timestamp );
                sellPrice = null;
                trade = false;
                localMax = 0;
                //sells.delete(sellPrice);
            }
        }
        cci.result.push(newCCI);
        cci.result.shift();
        rsi.result.push(newRSI);
        rsi.result.shift();
        macd.result.push(newMACD);
        macd.result.shift();
    }, function (err, row) {
        console.log(loss);
        console.log("num Sells:		" + numSells);
        console.log("num Stop Sell:	" + numStopSell);
        console.log("	num Stop Gain	" + numStopGain);
        console.log("	num Stop Loss	" + numStopLoss);
        //profit = (targetGain ** numSells);
        //console.log("percent profit:		" + ((profit -1)  * 100));
        var totalLoss = 0;
        for (var i = 0; i < loss.length; i++) {
            totalLoss += loss[i];
        }
        var avgLoss = totalLoss / loss.length;
        console.log("avg Loss:		" + avgLoss);
        var totalGain = 0;
        for (var i = 0; i < gain.length; i++) {
            totalGain += gain[i];
        }
        var avgGain = totalGain / gain.length;
        console.log("avg Gain:		" + avgGain);
        console.log("equity lost:	" + totalEquityLost);
        console.log("equity			" + equity);
        // db.run("INSERT INTO VarTest3 (StopDays, TargetGain, Strictness, Equity, EquityLost, NumSells, NumStopSells, NumStopLoss, AvgLoss, NumStopGain, AvgGain) VALUES ($stopDays, $targetGain, $strictness, $equity, $equityLost, $numSells, $numStopSells, $numStopLoss, $avgLoss, $numStopGain, $avgGain)", {
        // 	$equity: Math.round(equity), 
        // 	$equityLost: Math.round(totalEquityLost), 
        // 	$stopDays: days,
        // 	$targetGain: targetGain,
        // 	$strictness: strictness,
        // 	$numSells: numSells,
        // 	$numStopSells: numStopSell,
        // 	$numStopLoss: numStopLoss,
        // 	$avgLoss: avgLoss,
        // 	$numStopGain: numStopGain,
        // 	$avgGain: avgGain,
        // }, (err:any) => {
        // 	console.log(i);
        // });
    });
});
function percentChg(v1, v2) {
    return ((v1 - v2) / Math.abs(v2)) * 100.0;
}
function limitBuy(price) {
    return (price * targetGain);
}
