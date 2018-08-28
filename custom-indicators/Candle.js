import * as moment from 'moment';
export class Candle {
    constructor(open, high, low, close, exchange, product, duration, time) {
        if (time) {
            let momentTime = moment(time);
            if (momentTime.isValid()) {
                this.time = momentTime.format();
            }
            else {
                throw "Candle: Constructor: invald time format param passed";
            }
        }
        else {
            this.time = moment().format();
        }
        if (duration) {
            this.duration = duration;
        }
        else {
            this.duration = "1m";
        }
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.exchange = exchange;
        this.product = product;
    }
    get getOpen() {
        return this.open;
    }
    get getHigh() {
        return this.high;
    }
    get getLow() {
        return this.low;
    }
    get getClose() {
        return this.close;
    }
    get getTimestamp() {
        return this.time;
    }
    get getDuration() {
        return this.duration;
    }
    get getVolume() {
        return this.volume;
    }
    get getExchange() {
        return this.exchange;
    }
    get getProduct() {
        return this.product;
    }
}
