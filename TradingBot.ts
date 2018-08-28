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
import { GDAXConfig } from "gdax-trading-toolkit/build/src/exchanges/gdax/GDAXInterfaces";
import * as sqlite3 from 'sqlite3';
import * as moment from 'moment';
//import "moment-round";


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
const publicClient:any = new Gdax.PublicClient();
const logger = GTT.utils.ConsoleLoggerFactory();

const auth: any = {  
    key: process.env.GDAX_KEY, 
    secret: process.env.GDAX_SECRET, 
    passphrase: process.env.GDAX_PASSPHRASE };


const config: GDAXConfig = {
    logger: logger,
    auth: auth,
    apiUrl: GDAX_API_URL
};


const gdaxAPI = new GDAXExchangeAPI(config);
const [base, quote] = PRODUCT.split('-');
let db = new sqlite3.Database('./test.db');

let rsi: RSI;
let cci: CCI;
let macd: MACD;
let candle:CandleData = {open: 0.01, high: 0.01, low: 0.01, close: 0.01, timestamp: null};



const options: GDAXFeedConfig = {
    logger: logger,
    auth: auth,
    channels: ['ticker'],
    wsUrl: GDAX_WS_FEED,
    apiUrl: GDAX_API_URL
};

//  [ORDERID, TRADEID,  buyFillTime, type, size, price]
let sellOrder: [string, string, number, string, string, string] = ["", "", 0, "", "", ""]; 
//  [ORDERID, TRADEID,  selFillTime, type, size, price]
let buyOrder: [string, string, number, string, string, string] = ["", "", 0, "", "", ""]; 
//  [ORDERID, exchangeID, product]
let trade: [string, string, string] = ["",  EXCHANGEID, PRODUCT];
let beginTrading:boolean = false;
let activeTrade: boolean = false;
let activeSelling: boolean = false; 
let ticks:boolean = false;   




let date = moment();
let formatedDate:number =parseInt(date.format('x'));
let later5min: number = Math.ceil((formatedDate) / MILLIS5MIN) * MILLIS5MIN;
let millisTill5min: number = (later5min - formatedDate) ;
setTimeout( start, millisTill5min);
console.log(later5min);

console.log("Minutes till intialization: " + (millisTill5min/ (1000* 60)));




function start(): void {
    let check = moment();
    setInterval(update, MILLIS5MIN);
    ticks = true
    console.log("Begining intialization");
    console.log(check.format('x'));
    
    setTimeout( () => {
        beginTrading = true;
    }, MILLIS5MIN)
    intialUpdate();
}



GTT.Factories.GDAX.getSubscribedFeeds(options, [PRODUCT]).then((feed: GDAXFeed) => {

    GTT.Core.createTickerTrigger(feed, PRODUCT, false).setAction((ticker: TickerMessage) => {
        if(ticks) {
            const currTickPrice: number = parseFloat(ticker.price.toString()) ;
           
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
        }
        //console.log(candle);
        if(beginTrading) {
            console.log(candle);

            if(!activeTrade) {
                if(rsiBuyTest(candle.close) && cciTest(candle) && macdTest(candle.close)) {
                    
                    const buyPrice:Big = ticker.price.plus(.02);
                    activeTrade = true;
                    //let buyOrderId:string = submitTrade('buy', 'market', ".001", null,  buyPrice.toString(), null, null) ; //getTradeSize(PRODUCT, buyPrice.toString())
                    createTradeExecutedTrigger(feed, buyOrderId).setAction((event: TradeExecutedMessage) => {
                        activeSelling = true;
    	    	        db.run("INSERET INTO BuyReceipets(OrderID, TradeID, BuySubmitTime, BuyFillTime, Type, Size, Price) VALUES ($orderId, $tradeId, $buySub, $buyFill, $type, $size, $price);",{
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

                    const sellPrice: Big = ticker.price.plus(.02);
                    //let sellOrderId: string = submitTrade('sell', 'market', buyOrder[5], null,  sellPrice.toString(), null, null);
                    

            		createTradeExecutedTrigger(feed, sellOrderId).setAction((event: TradeExecutedMessage) => {
            		    activeTrade = false;
                        activeSelling = false;

                        db.run("INSERET INTO SellReceipets(OrderID, TradeID, SellSubmitTime, SellFillTime, Type, Size, Price) VALUES ($orderId, $tradeId, $sellSub, $sellFill, $type, $size $price);",{
                                $orderId: sellOrder[0],
                                $tradeId: sellOrder[1],
                                $sellSub: sellOrder[2],
                                $sellFill: event.time.getTime()/1000,
                                $type: sellOrder[3],
                                $size: sellOrder[4],
                                $price: parseFloat(event.price)
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
                        size: string, funds: string, price: string, time_in_force: string, 
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
        funds:funds,
        price: price,
        extra: { time_in_force: time_in_force, cancel_after: cancel_after }
    };
    
    gdaxAPI.placeOrder(order).then((result: LiveOrder) => {

        if(result.id){
            resultId = result.id;
            if( side === "buy") {
    	        
                let tradeID: string;
                db.get("SELECT TradeID FROM Trades ORDER BY TradeID DESC LIMIT 1;",
                    (err: any, row: any) => {
                        if(err){
                            //insert into err db
                            console.log(err);
                        }

                        if(row == null) {
                            tradeID = "10000";
                        } else {
                            tradeID = row.TradeID;
                        }
                    });
                
                tradeID = Big(tradeID).plus(1).toString();
                trade = [tradeID, EXCHANGEID, PRODUCT];
                buyOrder = [result.id, tradeID, result.time.getTime()/1000 , orderType, size, price ];
                
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
    console.log("Start of intialUpdate");

    let now = new Date();
    let dataMoment = new Date(Math.floor(now.getTime() / MILLIS5MIN) * MILLIS5MIN);

    publicClient.getProductHistoricRates(PRODUCT,
    {   granularity: GRANULARITY,
        start: new Date((dataMoment.getTime() - (MILLIS5MIN * 299)),
        end: dataMoment
    },
    (error:any, repsonse:any, data: number[][]) => {
        if(error) {
            console.log(error);
            return;
        } 

        let open: number[] = [];
        let close: number[] = [];
        let high: number[] = [];
        let low: number[] = [];

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

        rsi.result = rsi.result.slice(22);
        macd.result = macd.result.slice(7);
        cci.result = cci.result.slice(17);

        console.log(rsi.result[rsi.result.length-1]);
        console.log(cci.result[cci.result.length-1]);
        console.log(macd.result[macd.result.length-1]);
 
        console.log("End of intialUpdate");
        console.log("End of intialization");
    });

}

function update():void {
    console.log("Start of Update");
  
    let copyCandle: CandleData= JSON.parse(JSON.stringify(candle));
    candle = {open: 0.01, high: 0.01, low: 0.01, close: 0.01, timestamp: null};

    if( rsi.result.length === cci.result.length && 
        rsi.result.length === macd.result.length ) {

        cci.result.push(cci.nextValue(copyCandle));
        macd.result.push(macd.nextValue(copyCandle.close));
        rsi.result.push(rsi.nextValue(copyCandle.close));

        console.log(cci.result[cci.result.length -1]);
        console.log(rsi.result[rsi.result.length -1]);
        console.log(macd.result[macd.result.length -1]);

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
    {   granularity: GRANULARITY
    }, (err: any, response: any, data:any) => {
        if(err) {
            console.log(err);

            // send err to db
        } else {
            ///let prevcopyCandleTime:number = time;
            console.log(copyCandle.timestamp);
            for( let i = 0; i < data.length ; i++) {

                if( data[i][0] === copyCandle.timestamp){
                    console.log(data[i]);
                    if(data[i][1] === copyCandle.low && 
                        data[i][2] === copyCandle.high &&
                        data[i][3] === copyCandle.open &&
                        data[i][4] === copyCandle.close ) {
                            console.log("Tick tracker data and historical data consistent");
                            // db.run("INSERT INTO $table (Timestamp, Open, High, Low, Close)  VALUES( $timestamp, $open, $high, $low, $close", {
                            //     $timestamp: copyCandle.timestamp,
                            //     $open: copyCandle.open,
                            //     $high: copyCandle.high,
                            //     $low: copyCandle.low,
                            //     $close: copyCandle.close
                            // }, (err) => {
                            //     if(err){
                            //         //enter into err db
                            //     }
                            // });
                           
                    } else if(i == data.length - 1) {
                            console.log("Lows: " + data[i][1] + " " +copyCandle.low);
                            console.log("High: " + data[i][2] + " " + copyCandle.high);
                            console.log("Open: " + data[i][3] + " " + copyCandle.open);
                            console.log("Close: " + data[i][4] + " " + copyCandle.close);

                            //send err to db
                    }
                }      
            }
            
        }
        console.log("End of Update");
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
    let rsiEst: number = rsi.nextValue(priceEst);
    return  (// where my test trading logic goes

}

function rsiSellTest(priceEst: number):boolean { 
    let rsiEst: number = rsi.nextValue(priceEst);
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
//             logger.log('error', 'Push message failed',  err);
//             return;
//         }
//         logger.log('info', 'Push message result', res);
//     });
// }