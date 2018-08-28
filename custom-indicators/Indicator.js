import { Big } from "gdax-trading-toolkit/build/src/lib/types";
export class Indicator {
    // 	Constructor for Indicator object
    //	Feilds:		interval(number) = number OHLC candles to include in the indactor 
    //									example: 9, 15, 50
    //				exchange(string) = Trading exchange the indicator will be created on,
    //									not case senstive example GDAX, BITTREX, GEMNI
    //				product(string) = the coin-coin pair or coin-currency pair the indicator will be 
    //									created on example: BTC-USD
    constructor(interval, exchange, product) {
        this.interval = Big(interval);
        this.exchange = exchange;
        this.product = product;
        this.update();
    }
    //	Returns:	tracking interval of Indicator Object
    get getInterval() {
        return this.interval;
    }
    //	Returns:	exchanged tracked in Indicator Object
    get getExchange() {
        return this.exchange;
    }
    //	Returns:	product tracked in Indicator Object
    get getProduct() {
        return this.product;
    }
    // 	Returns:	most current Indicator Value
    get getCurrent() {
        return this.current;
    }
}
