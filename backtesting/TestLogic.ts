import { SMA, RSI, CCI, MACD, CandleData } from 'technicalindicators';
import * as sqlite3 from 'sqlite3';
//import * as Collections from 'typescript-collections';


import * as moment from 'moment';

let db = new sqlite3.Database('./test.db');
let results: {equity: number, equityLost: number, stopHours: number, numSells:number, numStopSells: number}[] = [];

// for(let j = 1; j <=7 ; j++) {
	let targetGain: number = 1.01; //+(.005 * j);

	// for( let i = 0; i <= 12; i++) {
		
		let strictness:number = 6 + (2 *.5);
		let days:number = 30;
		let stopTime: number = days*24 *3600;
		//let i: number = ;
		//let localTime = 24*14*3600;
		
		let open: number[] = [];
		let close: number[] = [];
		let high: number[] = [];
		let low: number[] = [];
		const periodSMA:number = 10;
		const periodRSI:number = 14;
		const periodCCI:number = 20;
		const macdFast:number = 15;
		const macdSlow:number = 30;
		const macdSignal:number = 8;
		let sma: any;
		let rsi: RSI;
		let cci: CCI;
		let macd: MACD;
		let trade: boolean = false;
		let sellPrice: number;
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
		//let sells: any = new Collections.Set<number>();
		let trades:number = 0;
		let localMax: number = 0;
		let gain:number[] = [];

		let startTime: number = 1483228800;
		let endTime: number = 1514764800;

		db.each("SELECT Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <= $dataEnd) ORDER BY Timestamp ASC;", {
			$dataStart: startTime,
				$dataEnd: startTime + (3600*6)
			}, 
			(err: any, row: any) => {
				close.push(row.Close);
				open.push(row.Open);
				high.push(row.High);
				low.push(row.Low);
			}, (err: any, row: any) => {
				rsi = new RSI( {values: close, period: periodRSI} );
				let inputCCI = { high: high, low: low, close: close, period: periodCCI};
				//console.log(rsi);
				cci = new CCI( inputCCI );
				//console.log(cci);
				let inputMACD = {	values: close, 
									fastPeriod: macdFast, 
									slowPeriod: macdSlow, 
									signalPeriod: macdSignal, 
									SimpleMAOscillator: false,
									SimpleMASignal: false
								};
				macd = new MACD( inputMACD);

				rsi.result = rsi.result.slice(21);
       			macd.result = macd.result.slice(6);
        		cci.result = cci.result.slice(16);

				db.each("SELECT Timestamp, Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <=  $dataEnd) ORDER BY Timestamp ASC;", {
					$dataStart: startTime + (3600*6),
					$dataEnd: endTime
				},
					(err: any, row: any) => {
						//console.log(row.Low);
						let candle: CandleData = {open: row.Open, high: row.High, low: row.Low, close: row.Close, timestamp: row.Timestamp};
						//console.log(candle);
						let newCCI: number = cci.nextValue(candle);
						//console.log(newCCI);
						let newRSI: number = rsi.nextValue(candle.close);
						//console.log(newRSI);
						let newMACD: any = macd.nextValue(candle.close);
						//console.log("new:" + newMACD.histogram);

						if(!trade) {
							let cciPrev: number = cci.result[cci.result.length - 1];
							let macdHistogramPrev: number = macd.result[macd.result.length -1 ].histogram;
							//console.log("prev" + macdPrev);
							let rsiPrev: number = rsi.result[rsi.result.length - 1];
							//console.log("prev: " + rsiPrev);

							let strictness:number = 7.6;
							if(	(cciPrev <= -100) && (macdHistogramPrev < 0) && (rsiPrev < 45) ) {
								//console.log("TEST 1 COMPLETE");
								if( (percentChg(newMACD.histogram,macdHistogramPrev) >= 10.0)) { //  (percentChg(newCCI, cciPrev) >= strictness) && (percentChg(newRSI, rsiPrev) >= strictness) && 
									trades++;
									trade = true;
									buyPrice = candle.close
									//sells.add(limitBuy(candle.close));
									sellPrice = candle.close * targetGain;
									numBuys++;
									buyMoment = moment.unix(candle.timestamp);
									//console.log("Buy:	" + candle.close + "	time:	" + buyMoment);
									//console.log("Buy:	" + candle.close + "	MCAD:	" +macdPrev + "-" + new);
								}
							}
						} else {
							//console.log("here");
							let intBuyTime:number = parseInt(buyMoment.format('X'));

							//for(let sellPrice of sells)
								if((sellPrice < candle.high) ) {
									numSells++;
									equity = (equity * sellPrice)/(buyPrice);
									let day = moment.unix(candle.timestamp);
									//console.log("Sell:	" + sellPrice + "	time:	" + day );
									sellPrice = null;
									trade = false;
									//localMax = 0;
									//sells.delete(sellPrice);
								
									
								} else if( (candle.timestamp - intBuyTime) >= stopTime) {
									numStopSell++;
									let lossEquity: number = (equity * candle.open)/(buyPrice);
									if( buyPrice <= candle.open) {
										numStopGain++
										gain.push(percentChg(candle.open, buyPrice));
									} else {
										numStopLoss++;
										
										
										//console.log("Equity:	" + Math.round(equity) + "	Loss Equity:	" + Math.round(lossEquity));
										totalEquityLost += (equity - lossEquity);
										//console.log(totalEquityLost);
										
										loss.push(percentChg(candle.open, buyPrice));
									}
									//console.log("Before:	" + equity + "	after:	" + lossEquity);
									equity = lossEquity;
									//console.log("Sell:	" + candle.open + "	time:	" + candle.timestamp );
									sellPrice = null;
									trade = false;
									//localMax = 0;
									//sells.delete(sellPrice);
							
								}							
						}
						cci.result.push(newCCI);
						cci.result.shift();
						rsi.result.push(newRSI);
						rsi.result.shift();
						macd.result.push(newMACD);
						macd.result.shift();
						
					}, (err: any, row: any) => {
						console.log(loss);
						console.log("num Sells:		" + numSells);
						console.log("num Stop Sell:	" + numStopSell);
						console.log("	num Stop Gain	" + numStopGain);
						console.log("	num Stop Loss	" + numStopLoss);
						profit = (targetGain ** numSells);
						//console.log("percent profit:		" + ((profit -1)  * 100));

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
						//console.log(trades);
						// db.run("INSERT INTO VarTest3 (StopDays, TargetGain, Strictness, Equity, EquityLost, NumSells, NumStopSells, NumStopLoss, AvgLoss, NumStopGain, AvgGain) VALUES ($stopDays, $targetGain, $strictness, $equity, $equityLost, $numSells, $numStopSells, $numStopLoss, $avgLoss, $numStopGain, $avgGain)", {
						// 	$stopDays: days,
						// 	$targetGain: targetGain,
						// 	$strictness: strictness,
						// 	$equity: Math.round(equity), 
						// 	$equityLost: Math.round(totalEquityLost), 
						// 	$numSells: numSells,
						// 	$numStopSells: numStopSell,
						// 	$numStopLoss: numStopLoss,
						// 	$avgLoss: avgLoss,
						// 	$numStopGain: numStopGain,
						// 	$avgGain: avgGain,
						// }, (err:any) => {
						// 	console.log(err);

						// });
					});
				//console.log(values);
				//console.log(result);
			});
// 	}
// }	
//console.log(results);

function percentChg( v1: number, v2: number) :number {
	//console.log(v1);
	//console.log(((v1-v2)/(v2))*100.0);
	return ((v1-v2)/Math.abs(v2))*100.0;
} 

// function limitBuy( price:number): number {
// 	return (price * targetGain)
// }


// } else if((candle.timestamp - intBuyTime) <= localTime && (localMax < candle.high )) {
// 								localMax = candle.high;
// 							} else if( ((localMax)  <= candle.high) || (candle.timestamp - intBuyTime) >= stopTime) {

// sma = new SMA({period: periodSMA, values: values});
// values.forEach(value => {
// 	var res = sma.nextValue(value);
// 	if(res) {
// 		sma.result.push(res);
// 	}
// })

// SELECT Timestamp, Open FROM CoinbaseBTCUSD WHERE Timestamp >= 1514764800 AND Timestamp <= 1514768400 ORDER BY Timestamp ASC;



