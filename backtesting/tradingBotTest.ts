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
import 'moment-round';


// const pusher = new GTT.utils.PushBullet(process.env.PUSHBULLET_KEY);
// const deviceID = process.env.PUSHBULLET_DEVICE_ID;

const PRODUCT = 'BTC-USD';
const PERIODRSI:number = 14;
const RSILIMIT: number = 30;
const PERIODCCI:number = 20;
const MACDFAST:number = 15;
const MACDSLOW:number = 30;
const MACDSIGNAL:number = 8;
const TRADERATE: number = 1.01;
const GRANULARITY: number = 300;
const STRICTNESS: number = 7.0;
const MACDLIMIT: number = -5.0;
const MACDHISTLIMIT: number = -1.0;
const CCILIMIT: number = -100;
const RSISELL: number = 70;
const MILLIS5MIN:number = 5*60*1000;
const EXCHANGEID: string = "gdax";

let publicClient:any = new Gdax.PublicClient();
const logger = GTT.utils.ConsoleLoggerFactory();
const gdaxAPI = GTT.Factories.GDAX.DefaultAPI(logger);
const [base, quote] = PRODUCT.split('-');
let db = new sqlite3.Database('./test.db');

let rsi: RSI;
let cci: CCI;
let macd: MACD;
let candle:CandleData;

const options: GDAXFeedConfig = {
    logger: logger,
    auth: { key: null, secret: null, passphrase: null }, // use public feed
    channels: ['ticker'],
    wsUrl: GDAX_WS_FEED,
    apiUrl: GDAX_API_URL
};

//  [ORDERID, TRADEID,  buyFillTime, type, size, price]
let sellOrder: [string, string, number, string, string, string] = ["", "", 0, "", "", ""]; 
//  [ORDERID, TRADEID,  selFillTime, type, size, price, return]
let buyOrder: [string, string, number, string, string, string] = ["", "", 0, "", "", ""]; 
//  [ORDERID, exchangeID, product]
let trade: [string, string, string] = ["",  EXCHANGEID, PRODUCT];
let beginTrading:boolean = false;
let activeTrade: boolean = false;
let activeSelling: boolean = false; 




let now = moment();
let millisTill5min = (moment(now).ceil(5, 'min').substract(now)).format('x');
setTimeout( start, millisTill5min);



function start(): void {
    setInterval(update, MILLIS5MIN);
    setTimeout( () => {
        beginTrading = true;
    }, MILLIS5MIN)
    intialUpdate();
    candle = {open: 0, high: 0, low: 0, close: 0, timestamp: null};

}



GTT.Factories.GDAX.getSubscribedFeeds(options, [PRODUCT]).then((feed: GDAXFeed) => {

    GTT.Core.createTickerTrigger(feed, PRODUCT, false).setAction((ticker: TickerMessage) => {
        const currTickPrice: number = parseInt(ticker.price.toString()) ;
       
        let tickTime: number = (ticker.time.getTime());
        if( candle.timestamp === null) {
            candle.timestamp = ( tickTime - (tickTime % 300000))/ 1000;

            candle.open = currTickPrice;
            candle.high = candle.open;
            candle.low = candle.open;
        } 

        if( currTickPrice > candle.high) {
                candle.high = currTickPrice;
        } else if( currTickPrice < candle.low) {
                candle.low = currTickPrice;
        }
        candle.close = currTickPrice;

        if(beginTrading) {
            

            if(!activeTrade) {
                if(rsiBuyTest(candle.close) && cciTest(candle) && macdTest(candle.close)) {
                    
                    const buyPrice:BigNumber = ticker.price.plus(.02);
                    activeOrder = true;
                    let buyOrderId:string = submitTrade('buy', 'limit', Big(20.00).div(buyPrice).toString(), buyPrice.toString(),'gtt', 'min') ;
                    createTradeExecutedTrigger(feed, buyOrderId).setAction((event: TradeExecutedMessage) => {
                        activeSelling = true;
    	    	        db.run("INSERET INTO BuyReceipets(OrderID, TradeID, BuySubmitTime, BuyFillTime, Type, Size) VALUES ($orderId, $tradeId, $buySub, $buyFill, $type, $size);",{
                            $orderId: buyOrder[0],
                            $tradeId: buyOrder[1],
                            $buySub: buyOrder[2],
                            $buyFill: event.time.getTime()/1000,
                            $type: buyOrder[4],
                            $size: buyOrder[5]
                        }, (err:any) => {
                            if(err){
                                // enter into error db
                            }
                            
                        });     
                    });
                }
            } else if(activeSelling) {
                if(rsiSellTest(candle.close)) {

                    const sellPrice: BigNumber = ticker.price.plus(.02);
                    let sellOrderId: string = submitTrade('sell', 'limit', buyOrder[5], sellPrice.toString(), 'gtc', null);
                    

            		createTradeExecutedTrigger(feed, sellOrderId).setAction((event: TradeExecutedMessage) => {
            		    activeTrade = false;
                        activeSeling = false;

                        db.run("INSERET INTO SellReceipets(OrderID, TradeID, SellSubmitTime, SellFillTime, Type, Size) VALUES ($orderId, $tradeId, $sellSub, $sellFill, $type, $size);",{
                                $orderId: sellOrder[0],
                                $tradeId: sellOrder[1],
                                $sellSub: sellOrder[2],
                                $sellFill: event.time.getTime()/1000,
                                $type: sellOrder[4],
                                $size: sellOrder[5]
                            }, (err:any) => {
                                if(err){
                                    // enter into error db
                                }
                                db.run("INSERET INTO Trades(TradeID, ProductID, ExchangeID) VALUES ($tradeId, $product, $exchange);",{
                                    $tradeId: trade[0],
                                    $product: trade[1],
                                    $exchange: trade[2],
                                }, (err:any) => {
                                    if(err){
                                        // enter into error db
                                    }
                                });
                                buyOrder = ["", "", 0, "", "", ""];
                                sellOrder = ["", "", 0, "", "", ""];
                                trade = ["",  EXCHANGEID, PRODUCT];
                            });
            	
            		    
            	    });
                }    
            }
        }
        
    });
});

function submitTrade(   side: string, orderType: string, 
                        size: string, price: string, time_in_force: string, 
                        cancel_after: string): string {
    if(side !== "buy" && side !== "sell") {
        throw "Correct order side of order not specified";
    }
    let resultId: string;
    const order: PlaceOrderMessage = {
        type: 'placeOrder',
        time: new Date(),
        productId: PRODUCT,
        orderType: orderType,
        side: side,
        size: size,
        price: price,
        extra: { time_in_force: time_in_force, cancel_after: cancel_after }
    };
    
    gdaxAPI.placeOrder(order).then((result: LiveOrder) => {

        if(result.id){
            resultId = result.id;
            if( side === "buy") {
    	        
                let tradeID: string;
                db.get("SELECT TradeID FROM Trades ORDER BY TradeID DESC LIMIT 1",
                    (err: any, row: any) => {
                        if(err){
                            //insert into err db
                        }

                        tradeID = row.TradeID;
                    });
                if(!tradeID) {
                    tradeID = "10000";
                }
                tradeID = Big(tradeID).plus(1).toString();
                trade = [tradeID, "gdax", "btc-usd"];
                buyOrder = [result.id, tradeID, result.time.getTime()/1000/1000 , orderType, size, price ];
                
            } else {
                sellOrder = [result.id, trade[0] , result.time.getTime()/1000, orderType, size, price];
            }

        }
    });
    return resultId;
}

function createTradeExecutedTrigger(    feed: ExchangeFeed, orderId: string, 
                                        onlyOnce: boolean = true): Trigger<TradeExecutedMessage> {
    const trigger = new Trigger<TradeExecutedMessage>(feed);
    const triggerCondition: TriggerFilter = (msg: StreamMessage) => {
        if (    msg.type === 'tradeExecuted' 
                && (msg as TradeExecutedMessage).orderId === orderId) {
            if(onlyOnce) {
                trigger.cancel();
            }

            trigger.execute(msg as TradeExecutedMessage);
        };
    }
    return trigger.setFilter(triggerCondition);
}    

let intialUpdate = function():void {

    // check prev candle in hostorical data update from then to now
    let dataMoment = moment().floor( 1, 'minute');
    publicClient.getProductHistoricRates(PRODUCT,
    {   granularity: GRANULARITY,
        start: dataMoment.substract(1500, 'm').format(),
        end: dataMoment
    },
    (error:any, repsonse:any, data: number[][]) => {
        if(error) {
            console.log(error);
            return;
        } 

        let open: number[] = new Array(GRANULARITY);
        let close: number[] = new Array(GRANULARITY);
        let high: number[] = new Array(GRANULARITY);
        let low: number[] = new Array(GRANULARITY);

        for(let i = 0; i < data.length; i++) {
            open.push(data[i][3]);
            high.push(data[i][2]);
            low.push(data[i][1]);
            close.push(data[i][4]);
        }

        rsi = new RSI( {values: close, period: PERIODRSI} );
        cci = new CCI( {high: high, low: low, close: close, period: PERIODCCI} );
        let inputMACD = {   values: close, 
                            fastPeriod: MACDFAST, 
                            slowPeriod: MACDSLOW, 
                            signalPeriod: MACDSIGNAL, 
                            SimpleMAOscillator: false,
                            SimpleMASignal: false
                        };
        macd = new MACD( inputMACD);

        rsi.result = rsi.result.slice(21);
        macd.result = macd.result.slice(6);
        cci.result = cci.result.slice(16);
    });
}

function update():void {
    let time: string = moment(candle.timestamp, 'x', true).format();
    if( rsi.result.length === cci.result.length && 
        rsi.result.length === macd.result.length ) {

        cci.result.push(cci.nextValue(candle));
        macd.result.push(macd.nextValue(candle.close));
        rsi.result.push(rsi.nextValue(candle.close));

        candle = {open: 0, high: 0, low: 0, close: 0, timestamp: null};

        if(rsi.result.length >= 10000) {
            rsi.result = rsi.result.slice(9000);
            macd.result = macd.result.slice(9000);
            cci.result = cci.result.slice(9000);
        }
    } else {
        //throw error to db
        beginTrading = false;
    }

    publicClient.getProductHistoricRates(PRODUCT,
    {   granularity: GRANULARITY,
        start: time,
        end: time
    }, (err: any, response: any, data:any) => {
        if(err) {
            // enter into err db
        } else {
            let prevCandleTime:number = parseInt(moment(time, moment.ISO_8601, true).format('X'));
            for( let i = 0; i < data.length; i++) {
                if(data[i][0] === prevCandleTime) {
                    db.run("INSERT INTO $table (Timestamp, Open, High, Low, Close)  VALUES( $timestamp, $open, $high, $low, $close", {
                        $timestamp: candle.timestamp,
                        $open: candle.open,
                        $high: candle.high,
                        $low: candle.low,
                        $close: candle.close
                    }, (err) => {
                        if(err){
                            //enter into err db
                        }
                    });
                }  
            }
        }
    });
}

function percentChg( v1: number, v2: number):number {
    return ((v1-v2)/Math.abs(v2))*100.0;
} 

function getTradeSize( product: string, price: BigNumber): BigNumber {
   let bal: AvailableBalance;

   gdaxAPI.loadBalances().then((balances: Balances) => {
        for (const profile in balances) {
                if(balances[profile][product]) {
                    bal = balances[profile][product];
                    
                }
            }
        }).catch(logError);
   if(bal.available.isEqualTo(ZERO))

   return (bal.available.div(price));

} 

function rsiBuyTest(priceEst: number): boolean {
    let rsiPrev: number = rsi.result[rsi.result.length - 1]; 
    let rsiEst: number = rsi.nextValue(parseInt(priceEst.toString()));
    return  // where my test trading logic goes

}

function rsiSellTest(priceEst: number):boolean { 
    let rsiEst: number = rsi.nextValue(parseInt(priceEst.toString()));
    return  (rsiEst >= RSISELL) ;

}

function macdTest(priceEst: number):boolean {
    let macdPrev: any = macd.result[macd.result.length - 1]; 
    let macdEst: any = macd.nextValue(priceEst);
    return  // where my test trading logic goes

}

function cciTest(candle: CandleData):boolean {
    let cciPrev: number = cci.result[cci.result.length - 1]; 
    let cciEst: number = cci.nextValue(candle);
    return  // where my test trading logic goes

}

function logError(err: any): void {
    console.log(err.message, err.response ? `${err.response.status}: ${err.response.body.message}` : '');
}

// function pushMessage(title: string, msg: string): void {
//     pusher.note(deviceID, title, msg, (err: Error, res: any) => {
//         if (err) {
//             logger.log('error', 'Push message failed', err);
//             return;
//         }
//         logger.log('info', 'Push message result', res);
//     });
// }