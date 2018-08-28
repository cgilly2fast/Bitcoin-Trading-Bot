import { RSI, CCI, MACD, CandleData } from 'technicalindicators';
import * as sqlite3 from 'sqlite3';

import * as moment from 'moment';
let db = new sqlite3.Database('./test.db');

let trade: boolean = false;
let priceThreshold: number;
let sellThresholdReached: boolean;
let sellHigh: number;

let secondSell: number;
let thirdSell: number;

let numBuys: number;
let profit: number = 0;
let numSells: number = 0;
let buyMoment:any = {};
let sellMoment: any ={};
let numStopSell: number = 0;
let numStopLoss: number = 0;
let numStopGain: number= 0;
let loss: number[] = [];
let equity: number = 1000;
let buyPrice: number = 0;
let totalEquityLost: number = 0; 
let trades:number = 0;
let localMax: number = 0;
let gain:number[] = [];
let data: any;
let strictness:number = 7.6;
let targetGain: number = 1.01;
let stopTime: number = 17 * 24 *3600;
let checkTime: number = 6 * 24 *3600;
let checkTime2: number = 12 * 24 * 3600;
let percentGain: any = 0;
let percentLoss: any = 0;
let threshold: number = 64;

db.all("SELECT CoinbaseBTCUSD5min.Timestamp, Open, High, Close, RSI, CCI, MACD, HistogramMACD FROM CoinbaseBTCUSD5min  INNER JOIN IndicatorValues ON CoinbaseBTCUSD5min.Timestamp = IndicatorValues.Timestamp WHERE (CoinbaseBTCUSD5min.Timestamp >= 1433116800) AND (CoinbaseBTCUSD5min.Timestamp <= 1472688000);",
		(err:any, rows: any) => {
			data = rows;
			// for (let i = 500; i < 800 ;i ++){
			// 	console.log(data[i]);
			// }	
			console.log(data.length);
			backTest(data);
			setTimeout(printOut, 15*1000);
			
	
	});


function backTest(data: any) {
	return new Promise((printOut:any) => {
		for(let i = 1; i < data.length; i++) {
			let cciPrev: number = data[ i -1 ].CCI;
			let macdHistogramPrev: number = data[ i - 1 ].HistogramMACD;
			let rsiPrev: number = data[ i - 1].RSI;
			let macdPrev: number = data[i-1].MACD;

			let cciCurr: number = data[i].CCI;
			let rsiCurr: number = data[i].RSI
			let histCurr: number = data[i].HistogramMACD;
			let macdCurr: number = data[i].MACD;
			let closeCurr: number = data[i].Close;
			let openCurr: number = data[i].Open;
			let highCurr: number = data[i].High;
			if(!trade) {

				if(	(cciPrev <= -100) && (macdHistogramPrev < 0) && (rsiPrev < 30) ) { // 
					if(	(percentChg(cciCurr, cciPrev) >= strictness) && 
						(percentChg(rsiCurr, rsiPrev) >= strictness) &&//&& 
						(percentChg(histCurr, macdHistogramPrev) >= strictness) && // (percentChg(macdCurr, macdPrev) >= 1.0) &&
						 (macdPrev <= -1.0)) { //

						trades++;
						trade = true;
						buyPrice = closeCurr;
						priceThreshold =  closeCurr * targetGain;
					
						buyMoment = moment.unix(data[i].Timestamp);
					}
				}
			} else {
				if((priceThreshold <= highCurr || rsiPrev >= 70.0) && sellThresholdReached == false) {
					sellThresholdReached = true;
					sellHigh = closeCurr; 
				}

				if(sellThresholdReached) {
					if(sellHigh < closeCurr) {
						sellHigh = closeCurr;
					} else if(percentChg(sellHigh, closeCurr) <= -.5) {
						numSells++;
						equity = (equity * sellPrice)/(buyPrice);
						sellTimes[duration]++;

					} 
				}

			}

		}
	});
}

function printOut() {
	console.log(sellTimes);
	// console.log(stopSellTimes);
	//console.log(firstSellTimes);
	console.log("num Sells:		" + numSells);
	console.log("num Stop Sell:	" + numStopSell);
	console.log("	num Stop Gain	" + numStopGain);
	console.log("	num Stop Loss	" + numStopLoss);
	profit = (targetGain ** numSells);
	//console.log("percent profit:		" + ((profit -1)  * 100));
	console.log("Avg Percent Gain:	" + percentGain / numSells);
	console.log("Avg Percent Loss:	" + percentLoss / numStopLoss);
	let totalLoss: number = 0;
	for(let i = 0; i < loss.length ; i++) {
		totalLoss += loss[i];
	}
	let avgLoss: number = totalLoss / loss.length;
	console.log("avg Loss:		" + avgLoss);

	let totalGain: number = 0;
	for(let i = 0; i < gain.length ; i++) {
		totalGain += gain[i];
	}
	let avgGain: number = totalGain / gain.length;

	console.log("avg Gain:		" + avgGain);
	console.log("equity lost:	" + totalEquityLost);
	console.log("equity			" + equity);
}

function percentChg( v1: number, v2: number):number {
    return ((v1-v2)/Math.abs(v2))*100.0;
} 			