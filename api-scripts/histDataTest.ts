import * as Gdax from 'gdax';
import { RSI, CCI, MACD, CandleData } from 'technicalindicators';
let rsi: RSI;
let cci: CCI;
let macd: MACD;
let candle:CandleData = {open: 0.01, high: 0.01, low: 0.01, close: 0.01, timestamp: null};

const PRODUCT = 'BTC-USD';
const PERIODRSI:number = 14;
const PERIODCCI:number = 20;
const MACDFAST:number = 15;
const MACDSLOW:number = 30;
const MACDSIGNAL:number = 8;
const GRANULARITY: number = 300;
const MILLIS5MIN:number = 5*60*1000;


const publicClient:any = new Gdax.PublicClient();

let now = new Date();
let dataMoment = Math.floor(now.getTime() / MILLIS5MIN) * MILLIS5MIN;
// console.log(dataMoment);
let open: number[] = [];
let close: number[] = [];
let high: number[] = [];
let low: number[] = [];

let end:number = 2;
let cuim: any = [];
//let i: number = 1;
for( let i = 1; 1 <= end; i++) {    
    // console.log(dataMoment - ((i *MILLIS5MIN * 299) + MILLIS5MIN));
    // console.log( dataMoment - ((i-1) *MILLIS5MIN * 300));
    // setTimeout( function() {
        publicClient.getProductHistoricRates(PRODUCT,
        {   granularity: GRANULARITY,
            start: new Date(dataMoment - ((i *MILLIS5MIN * 299) + MILLIS5MIN) ),
            end: new Date(dataMoment - ((i-1) *MILLIS5MIN * 300))
        },
        (error:any, repsonse:any, data: number[][]) => {
            if(error) {
                console.log(error);
                return;
            } 

            // for(let j = 0; j < data.length; i++) {
            //     open.push(data[j][3]);
            //     high.push(data[j][2]);
            //     low.push(data[j][1]);
            //     close.push(data[j][4]);
            // }

            //cuim.push(data);
            console.log(data[0][0]);
            console.log(data[data.length-1][0]);

            // if(i === end) {
            //     //console.log(cuim.length);
            //     rsi = new RSI( {values: close, period: PERIODRSI} );
            //     cci = new CCI( {high: high, low: low, close: close, period: PERIODCCI} );
            //     let inputMACD = {   values: close, 
            //                         fastPeriod: MACDFAST, 
            //                         slowPeriod: MACDSLOW, 
            //                         signalPeriod: MACDSIGNAL, 
            //                         SimpleMAOscillator: false,
            //                         SimpleMASignal: false
            //                     };
            //     macd = new MACD( inputMACD);

            //     rsi.result = rsi.result.slice(22);
            //     macd.result = macd.result.slice(7);
            //     cci.result = cci.result.slice(17);
        
            //     //console.log("Counts:    " + rsi.result.length +", " + cci.result.length +", " + macd.result.length);
            // }
        });//}, i*5000);    
}    
