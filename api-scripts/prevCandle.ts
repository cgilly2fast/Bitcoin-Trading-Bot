import * as GTT from "gdax-trading-toolkit";
import { Big, ZERO } from "gdax-trading-toolkit/build/src/lib/types";
import * as Gdax from 'gdax';
import { GDAX_WS_FEED, GDAXFeed, GDAXFeedConfig, ExchangeFeed } from "gdax-trading-toolkit/build/src/exchanges";
import { GDAX_API_URL, GDAXExchangeAPI } from "gdax-trading-toolkit/build/src/exchanges/gdax/GDAXExchangeAPI";
import { PlaceOrderMessage, TickerMessage, TradeExecutedMessage, 
         StreamMessage, TriggerFilter, Trigger } from "gdax-trading-toolkit/build/src/core";
import { LiveOrder } from "gdax-trading-toolkit/build/src/lib";
import { RSI, CCI, MACD, CandleData } from 'technicalindicators';
import { AvailableBalance, Balances } from 'gdax-trading-toolkit/build/src/exchanges/AuthenticatedExchangeAPI';
import * as sqlite3 from 'sqlite3';
import * as moment from 'moment';

const PRODUCT: string = 'BTC-USD';
const GRANULARITY: number = 300;
const MILLIS5MIN:number = 5*60*1000;
const MIN5: number = 5*60;
let date = moment();
console.log(date.format('X'));  //or use any other date
let later5min: number = Math.ceil(parseInt(date.format('X')) / MIN5) * MIN5;

let publicClient:any = new Gdax.PublicClient();
let now: Date = new Date();
let time: Date = new Date( (Math.floor( (now.getTime() / MILLIS5MIN) ) * MILLIS5MIN ) -MILLIS5MIN);

    console.log((later5min ));

    publicClient.getProductHistoricRates(PRODUCT,
    {   granularity: GRANULARITY
    }, (err: any, response: any, data:any) => {
        if(err) {
            console.log(err);
        } else {
            let prevCandleTime:number = time.getTime()/1000;
            // console.log(data);
            // console.log(data[0][0]);
            // console.log(prevCandleTime);
            // console.log(data[0][0] == prevCandleTime);
            for( let i = 0; i < data.length; i++) {
            	console.log(i);
                if(data[i][0] === prevCandleTime) {
                    console.log(typeof data[i][0]);
                    console.log(typeof data[i][0]);
                    console.log("timestamps are equal");
                    if( data[i][1] === candle.low && 
                        data[i][2] === candle.high &&
                        data[i][3] === candle.open &&
                        data[i][4] === candle.close ) {
                        console.log("Tick tracker data and historical data consistent");
                    }
                    // db.run("INSERT INTO $table (Timestamp, Open, High, Low, Close)  VALUES( $timestamp, $open, $high, $low, $close", {
                    //     $timestamp: candle.timestamp,
                    //     $open: candle.open,
                    //     $high: candle.high,
                    //     $low: candle.low,
                    //     $close: candle.close
                    // }, (err) => {
                    //     if(err){
                    //         //enter into err db
                    //     }
                    // });
                }  
            }
            //candle = {open: 0.01, high: 0.01, low: 0.01, close: 0.01, timestamp: null};;
        }
        console.log("End of Update");
    });