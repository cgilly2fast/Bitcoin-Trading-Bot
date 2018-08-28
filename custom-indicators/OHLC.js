"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var Candle = /** @class */ (function () {
    //private volume: number;
    function Candle(open, high, low, close, time) {
        if (time) {
            if (moment(time).isValid()) {
                this.time = moment(time).format();
            }
            else {
                throw "OHLC Constructor: invald time format param passed";
            }
        }
        else {
            this.time = moment().format();
        }
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }
    Object.defineProperty(Candle.prototype, "getTimestamp", {
        get: function () {
            return this.time;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Candle.prototype, "getOpen", {
        get: function () {
            return this.open;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Candle.prototype, "getHigh", {
        get: function () {
            return this.high;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Candle.prototype, "getLow", {
        get: function () {
            return this.low;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Candle.prototype, "getClose", {
        get: function () {
            return this.close;
        },
        enumerable: true,
        configurable: true
    });
    return Candle;
}());
exports.Candle = Candle;
