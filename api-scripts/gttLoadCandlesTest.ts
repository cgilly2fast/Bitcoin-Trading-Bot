import * as GTT from "gdax-trading-toolkit";
import { GDAX_API_URL, GDAXExchangeAPI } from "gdax-trading-toolkit/build/src/exchanges/gdax/GDAXExchangeAPI";
import { GDAX_WS_FEED, GDAXFeed, GDAXFeedConfig } from "gdax-trading-toolkit/build/src/exchanges";
import { CandleRequestOptions, Candle } from "gdax-trading-toolkit/build/src/exchanges/PublicExchangeAPI"
import * as sqlite3 from 'sqlite3';
import * as moment from 'moment';
import { ConsoleLoggerFactory } from 'gdax-trading-toolkit/build/src/utils/Logger';
import { DefaultAPI } from 'gdax-trading-toolkit/build/src/factories/gdaxFactories';
//let fs = require('fs');

const logger = GTT.utils.ConsoleLoggerFactory();
const gdax = GTT.Factories.GDAX.DefaultAPI(logger);
//let gdax = new GDAXExchangeAPI(options);
let startTime:number = 1515369600;
//let endTime:any = moment('1529001240', 'X', true);
const PRODUCT = 'BTC-USD';

//console.log( "Start Time:	" + startTime.format() + "	End Time:	" +startTime.add(300, 'm').format());
// let results:any = rates(startTime, endTime);
// console.log(results);

// let unfinished:number[] = [635,
// 636,
// 637,
// 638,
// 639,
// 640]

const  candleRequestOptions :  CandleRequestOptions  = {
    gdaxProduct: PRODUCT,
    interval: '5m',
    from: new Date(startTime),
    limit: 300,
    extra: null
}


	
//let s = moment( ((unfinished[i]*18000) + startTime).toString() , "X", true);
//console.log(s);
gdax.loadCandles(candleRequestOptions).then((candle: Candle[]) => {
	console.log("Start:		" + candle[0] + "	End:	" + candle[candle.length-1]);
	console.log(candle.length);

})
//}


