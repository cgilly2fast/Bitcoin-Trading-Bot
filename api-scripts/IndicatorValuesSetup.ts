import {  RSI, CCI, MACD, CandleData } from 'technicalindicators';
import * as sqlite3 from 'sqlite3';
//import * as moment from 'moment';

let db = new sqlite3.Database('./test.db');

let o: number[] = new Array(1400000);
let c: number[] = new Array(1400000);
let h: number[] = new Array(1400000);
let l: number[] = new Array(1400000);
let timestamp:string[] = [];

const periodRSI:number = 14;
const periodCCI:number = 20;
const macdFast:number = 12;
const macdSlow:number = 26;
const macdSignal:number = 9;

let rsi: RSI;
let cci: CCI;
let macd: MACD;

let startTime: number = 1512086400; 
let endTime: number =  startTime +(60*300);

db.each("SELECT Timestamp, Open, High, Low, Close FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= $dataStart) AND (Timestamp <= $dataEnd) ORDER BY Timestamp ASC;", {
			$dataStart: startTime,
			$dataEnd: endTime
			}, 
			(err: any, row: any) => {
				timestamp.push(row.Timestamp)
				c.push(row.Close);
				o.push(row.Open);
				h.push(row.High);
				l.push(row.Low);
			}, (err: any, row: any) => {
				rsi = new RSI( {values: c, period: periodRSI} );
				let inputCCI = { high: h, low: l, close: c, period: periodCCI};
				//console.log(inputCCI);
				cci = new CCI( inputCCI );
				let inputMACD = {	values: c, 
									fastPeriod: macdFast, 
									slowPeriod: macdSlow, 
									signalPeriod: macdSignal, 
									SimpleMAOscillator: false,
									SimpleMASignal: false
								};
				macd = new MACD( inputMACD);

				//console.log(macd.result)
				for( let i:number = 0; i < 36; i++) {
					timestamp.shift();
				}

				// for( let i:number = 0; i < 22; i++) {
				// 	rsi.result.shift();
				// }

				// for( let i:number = 0; i < 17; i++) {
				// 	cci.result.shift();
				// } 
				// for( let i:number = 0; i < 7; i++) {
				// 	macd.result.shift();
				// } 

				let smRSI: any = rsi.result.slice(22);
				rsi.result = smRSI;
				// console.log(smRSI);
				// console.log( rsi.result);
				let smMACD: any = macd.result.slice(11);
        		macd.result = smMACD;
        		let smCCI:any = cci.result.slice(17);
        		cci.result = smCCI;
				

				if(	rsi.result.length === cci.result.length && 
					rsi.result.length === macd.result.length 
					) { // && timestamp.length === rsi.result.length

					//console.log("Success!");
					
					console.log(macd.result)
					// for( let i = 0; i < rsi.result.length; i++) {
						
					// 	db.run("INSERT INTO IndicatorValues5Min( Timestamp, RSI, CCI, MACD, HistogramMACD ) VALUES ($timestamp, $rsi, $cci, $macd, $histogramMACD);", {
					// 		$timestamp: timestamp[i],
					// 		$rsi: rsi.result[i],
					// 		$cci: cci.result[i],
					// 		$macd: macd.result[i].MACD,
					// 		$histogramMACD: macd.result[i].histogram
					// 	}, (err:any, row: any) => {
					// 		if(err) {
					// 			console.log(err);
					// 		}
					// 	});
					// }	
			
				} else {
					//console.log("Failed:	" + rsi.result.length + ", " + timestamp.length +", " + cci.result.length +", " + macd.result.length);
					console.log("Failed:	" + rsi.result.length +", " + cci.result.length +", " + macd.result.length);

				}
			
			});





