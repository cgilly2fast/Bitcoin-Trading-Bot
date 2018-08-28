"use strict";
exports.__esModule = true;
var technicalindicators_1 = require("technicalindicators");
var sqlite3 = require("sqlite3");
var Collections = require("typescript-collections");
var db = new sqlite3.Database('./test.db');
var stopTime = 14 * 24 * 3600;
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
var numStopSell = 0;
var numStopLoss = 0;
var numStopGain = 0;
var loss = [];
var equity = 1500;
var numBuys = 0;
var totalEquityLost = 0;
var numTrades = 15.0;
var profit = 0;
var numSells = 0;
var orderID = 0;
var sells = new Collections.Bag();
var startTime = 1483228800;
var endTime = 1515304800;
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
        var candle = { open: row.Open, high: row.High, low: row.Low, close: row.Close, timestamp: row.Timestamp };
        var newCCI = cci.nextValue(candle);
        var newRSI = rsi.nextValue(candle.close);
        var newMACD = macd.nextValue(candle.close);
        if (sells.size() < numTrades) {
            var cciPrev = cci.result[cci.result.length - 1];
            var macdPrev = macd.result[macd.result.length - 1].histogram;
            var rsiPrev = rsi.result[rsi.result.length - 1];
            if ((cciPrev <= -100) && (macdPrev < 0) && (rsiPrev < 45)) {
                if ((percentChg(newCCI, cciPrev) >= 10.0) && (percentChg(newRSI, rsiPrev) >= 10.0) && (percentChg(newMACD.histogram, macdPrev) >= 10.0)) {
                    orderID++;
                    sells.add(new Order((orderID.toString()), candle.close, limitBuy(candle.close), (equity / numTrades), (candle.timestamp)));
                    numBuys++;
                }
            }
        }
        if (sells.size() >= 1) {
            sells.forEach(function (sale) {
                if ((sale.sellPrice < candle.high)) {
                    numSells++;
                    equity += ((sale.equity * sale.sellPrice) / (sale.buyPrice)) - sale.equity;
                    // console.log(sale);
                    // console.log(candle.high);
                    sells.remove(sale);
                }
                else if ((candle.timestamp - sale.tradeStartTime) >= stopTime) {
                    if ((percentChg(candle.open, sale.sellPrice)) <= -8.0 || (candle.timestamp - sale.tradeStartTime) >= (stopTime + 7 * 24 * 3600)) {
                        numStopSell++;
                        if (sale.sellPrice <= candle.open) {
                            numStopGain++;
                            //equity = (equity * sellPrice)/(buyPrice);
                        }
                        else {
                            numStopLoss++;
                            var lossEquity = sale.equity - (((sale.equity) * candle.open) / (sale.buyPrice));
                            //console.log("Equity:	" + Math.round(equity) + "	Loss Equity:	" + Math.round(lossEquity));
                            totalEquityLost += lossEquity;
                            equity -= lossEquity;
                            loss.push([{ chg: Math.round(percentChg(candle.open, sale.sellPrice) * 100) / 100,
                                    id: sale.id,
                                    lEquity: Math.round(lossEquity * 100) / 100,
                                    tEquity: Math.round(equity * 100) / 100 }]);
                        }
                        //console.log("Sell:	" + candle.open + "	time:	" + candle.timestamp );
                        sells.remove(sale);
                    }
                }
            });
        }
        cci.result.push(newCCI);
        rsi.result.push(newRSI);
        macd.result.push(newMACD);
    }, function (err, row) {
        data();
    });
});
function percentChg(v1, v2) {
    //console.log(v1);
    //console.log(((v1-v2)/(v2))*100.0);
    return ((v1 - v2) / Math.abs(v2)) * 100.0;
}
function limitBuy(price) {
    return (price * 1.01);
}
function data() {
    console.log(loss);
    // sells.forEach( order => {
    // 	console.log(order);
    // });
    console.log("num Sells:		" + numSells);
    console.log("num Stop Sell:	" + numStopSell);
    console.log("	num Stop Gain	" + numStopGain);
    console.log("	num Stop Loss	" + numStopLoss);
    profit = (Math.pow(1.001, numSells));
    console.log("percent profit:		" + ((profit - 1) * 100));
    var total = 0;
    for (var i = 0; i < loss.length; i++) {
        total += loss[i];
    }
    var avg = total / loss.length;
    console.log("avg Loss:		" + avg);
    console.log("equity lost:	" + totalEquityLost);
    console.log("equity			" + equity);
}
var Order = /** @class */ (function () {
    function Order(id, bPrice, sPrice, eqty, time) {
        this.id = id;
        this.buyPrice = bPrice;
        this.sellPrice = sPrice;
        this.equity = eqty;
        this.tradeStartTime = time;
    }
    Order.prototype.toString = function () {
        return this.id;
    };
    return Order;
}());
