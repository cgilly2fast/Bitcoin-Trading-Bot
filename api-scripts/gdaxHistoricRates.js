"use strict";
exports.__esModule = true;
var Gdax = require("gdax");
var sqlite3 = require("sqlite3");
var moment = require("moment");
//let fs = require('fs');
var db = new sqlite3.Database('./test.db');
var publicClient = new Gdax.PublicClient();
var startTime = 1515369600;
var endTime = moment('1529001240', 'X', true);
//console.log( "Start Time:	" + startTime.format() + "	End Time:	" +startTime.add(300, 'm').format());
// let results:any = rates(startTime, endTime);
// console.log(results);
var unfinished = [635,
    636,
    637,
    638,
    639,
    640];
var _loop_1 = function (i) {
    setTimeout(function () {
        var s = moment(((unfinished[i] * 18000) + startTime).toString(), "X", true);
        //console.log(s);
        publicClient.getProductHistoricRates('BTC-USD', { granularity: 60,
            start: s.format(),
            end: s.add(300, 'm').format()
        }, function (error, repsonse, data) {
            if (error) {
                //console.log(error);
                console.log(unfinished[i] + ",");
            }
            else {
                //console.log(data);
                for (var j = 0; j < data.length; j++) {
                    db.run("INSERT INTO TestValues (Timestamp, Open, High, Low, Close, Volume) VALUES ($timestamp, $open, $high, $low, $close, $volume)", {
                        $timestamp: data[j][0],
                        $low: data[j][1],
                        $high: data[j][2],
                        $open: data[j][3],
                        $close: data[j][4],
                        $volume: data[j][5]
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        });
    }, i * 300);
};
for (var i = 0; i < unfinished.length; i++) {
    _loop_1(i);
}
