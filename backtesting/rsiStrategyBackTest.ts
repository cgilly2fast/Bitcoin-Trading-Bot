import * as sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./test.db');
import * as moment from 'moment';

	let trade: boolean = false;
	let sellPrice: number;
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
	let sellTimes: number[] = [];
	sellTimes.length = 45;
	for(let i = 0; i <sellTimes.length -1; i++) {
		sellTimes[i] = 0;
	}

	let firstSellTimes: number[] = [];
	firstSellTimes.length = 24;
	for(let i = 0; i <firstSellTimes.length -1; i++) {
		firstSellTimes[i] = 0;
	}

	let stopSellTimes: number[] = [];
	stopSellTimes.length = 45;
	for(let i = 0; i <stopSellTimes.length -1; i++) {
		stopSellTimes[i] = 0;
	}
	// {
	// 	day0: 0,
	// 	day1: 0,
	// 	day2: 0,
	// 	day3: 0,
	// 	day4: 0,
	// 	day5: 0,
	// 	day6: 0,
	// 	day7: 0,
	// 	day8: 0,
	// 	day9: 0,
	// 	day10: 0,
	// 	day11: 0,
	// 	day12: 0,
	// 	day13: 0,
	// 	day14: 0,
	// 	day15: 0,
	// 	day17: 0,
	// 	day18: 0,
	// 	day19: 0,
	// 	day20: 0,
	// 	day21: 0,
	// 	day22: 0,
	// }

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
						 (macdCurr <= -1.0)) { //

						trades++;
						trade = true;
						buyPrice = closeCurr;
						sellPrice =  closeCurr * targetGain;
						secondSell = closeCurr * 1.005;
						thirdSell = closeCurr * .92;
						numBuys++;
						buyMoment = moment.unix(data[i].Timestamp);
					}
				}
			} else {
				
				let intBuyTime:number = parseInt(buyMoment.format('X'));
				let timeDiff: number = (data[i].Timestamp - intBuyTime);
				let duration: number = Math.floor(((parseInt(data[i].Timestamp) - intBuyTime)/(60*60*24)));
				let duration24: number = Math.floor(((parseInt(data[i].Timestamp) - intBuyTime)/(60*60)));
				//let change: number;
				
				if(	(timeDiff < checkTime && sellPrice <= highCurr) ) {
					numSells++;
					equity = (equity * sellPrice)/(buyPrice);
					sellTimes[duration]++;
					if(duration24 < 24) {
						firstSellTimes[duration24]++;
					}
					change = (sellPrice/buyPrice) - 1;
					sellPrice = null;
					secondSell = null;
					thirdSell = null;
					trade = false;
					localMax = 0;
				} else if( timeDiff >= checkTime && secondSell <= highCurr &&
							timeDiff < checkTime2) {
					numSells++;
					equity = (equity * secondSell)/(buyPrice);
					sellTimes[duration]++;
					change = (secondSell/buyPrice) - 1;
					sellPrice = null;
					secondSell = null;
					thirdSell = null;
					trade = false;
					localMax = 0;
				} else if( timeDiff >= checkTime2 && thirdSell <= highCurr && timeDiff < stopTime) {

					numStopSell++;
					let lossEquity: number = (equity * thirdSell)/(buyPrice);
					numStopLoss++;
					totalEquityLost += (equity - lossEquity);
					loss.push(percentChg(highCurr, buyPrice));
					equity = lossEquity;

					stopSellTimes[duration]++;
					change = (thirdSell/buyPrice) - 1

					sellPrice = null;
					secondSell = null;
					thirdSell = null;
					trade = false;
					localMax = 0;
				} else if(timeDiff >= stopTime ) {
					numStopSell++;
					let lossEquity: number = (equity * openCurr)/(buyPrice);
				
					numStopLoss++;
					totalEquityLost += (equity - lossEquity);
					loss.push(percentChg(openCurr, buyPrice));
					equity = lossEquity;
					stopSellTimes[duration]++;
					change = (openCurr/buyPrice) - 1
					sellPrice = null;
					secondSell = null;
					thirdSell = null;
					trade = false;
					localMax = 0;
				} else {
					if(change){
						if( change > 0 ){
							percentGain += change;
							//numSells++;
						} else {
							//console.log("Row1:" + data[i-1].toString());
							//console.log("Row2:" + data[i].toString());
							numStopLoss++
							percentLoss += change;
						}
					}
					
				}	
					
					

					//console.log(typeof data[i].Timestamp);
				

				// if( rsiPrev>= 70.0 && percentChg(rsiCurr, rsiPrev)) {
					
				// 	let change = (closeCurr/buyPrice) - 1;
				// 	if( change > 0 ){
				// 		percentGain += change;
				// 		numSells++;
				// 		sellTimes[duration]++
				// 	} else {
				// 		//console.log("Row1:" + data[i-1].toString());
				// 		//console.log("Row2:" + data[i].toString());
				// 		numStopLoss++
				// 		percentLoss += change;
				// 	}
					
				// 	equity = (equity * closeCurr)/(buyPrice);
				// 	//sellPrice = null;
				// 	trade = false;
				// }	
												
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