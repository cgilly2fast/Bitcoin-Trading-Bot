import { RSI, CCI, MACD, CandleData } from 'technicalindicators';
import * as sqlite3 from 'sqlite3';
import * as Collections from 'typescript-collections';

let db = new sqlite3.Database('./test.db');

	let stopTime: number = 14*24*3600;

	let open: number[] = [];
	let close: number[] = [];
	let high: number[] = [];
	let low: number[] = [];

	let periodRSI:number = 14;
	let periodCCI:number = 20;
	let macdFast:number = 15;
	let macdSlow:number = 30;
	let macdSignal:number = 8;

	let rsi: RSI;
	let cci: CCI;
	let macd: MACD;

	let numStopSell: number = 0;
	let numStopLoss: number = 0;
	let numStopGain: number= 0;
	let loss: any[] = [];
	let equity: number = 1500;
	let numBuys: number = 0;
	let totalEquityLost: number = 0;
	let numTrades: number = 15.0;
	let profit: number = 0;
	let numSells: number = 0; 
	let orderID: number = 0;
	let sells: Collections.Bag<Order> = new Collections.Bag<Order>();

	let startTime: number = 1483228800;
	let endTime: number = 1515304800;

		db.each("SELECT Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <= $dataEnd) ORDER BY Timestamp ASC;", {
			$dataStart: startTime,
			$dataEnd: startTime + (3600*6)
		}, (err: any, row: any) => {
			close.push(row.Close);
			open.push(row.Open);
			high.push(row.High);
			low.push(row.Low);
		}, (err: any, row: any) => {
			rsi = new RSI( {values: close, period: periodRSI} );
			let inputCCI = {high: high, low: low, close: close, period: periodCCI};
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
			//console.log(macd);

			db.each("SELECT Timestamp, Open, High, Low, Close FROM CoinbaseBTCUSD WHERE (Timestamp >= $dataStart) AND (Timestamp <=  $dataEnd) ORDER BY Timestamp ASC;", {
				$dataStart: startTime + (3600*6),
				$dataEnd: endTime
				}, (err: any, row: any) => {
					let candle: CandleData = {open: row.Open, high: row.High, low: row.Low, close: row.Close, timestamp: row.Timestamp};
					let newCCI: number = cci.nextValue(candle);
					let newRSI: number = rsi.nextValue(candle.close);
					let newMACD: any = macd.nextValue(candle.close);

					if(sells.size() < numTrades) {
						let cciPrev: number = cci.result[cci.result.length - 1];
						let macdPrev: number = macd.result[macd.result.length -1 ].histogram;
						let rsiPrev: number = rsi.result[rsi.result.length - 1];

						if(	(cciPrev <= -100) && (macdPrev < 0) && (rsiPrev < 45) ) {
							
							if(  (percentChg(newCCI, cciPrev) >= 10.0) && (percentChg(newRSI, rsiPrev) >= 10.0) && (percentChg(newMACD.histogram,macdPrev) >= 10.0)) { 
								orderID++;
								sells.add(new Order( (orderID.toString()), candle.close, limitBuy(candle.close), (equity/numTrades), (candle.timestamp)));
								numBuys++;
							}
						}
					} 

					if(sells.size() >= 1){
						sells.forEach( sale => {
							
							if((sale.sellPrice < candle.high) ) {
								numSells++;
								equity += ((sale.equity * sale.sellPrice)/(sale.buyPrice)) - sale.equity;
								// console.log(sale);
								// console.log(candle.high);
								sells.remove(sale);
							
								
							} else if((candle.timestamp - sale.tradeStartTime) >= stopTime ) {

								if((percentChg(candle.open, sale.sellPrice)) <= -8.0 || (candle.timestamp - sale.tradeStartTime) >= (stopTime + 7*24*3600)) {
									numStopSell++;
									if( sale.sellPrice <= candle.open) {
										numStopGain++
										//equity = (equity * sellPrice)/(buyPrice);
									} else {
										numStopLoss++;
										
										let lossEquity: number = sale.equity - (((sale.equity) * candle.open)/(sale.buyPrice));
										//console.log("Equity:	" + Math.round(equity) + "	Loss Equity:	" + Math.round(lossEquity));
										totalEquityLost +=  lossEquity;
										equity -= lossEquity;
										loss.push([{	chg: Math.round(percentChg(candle.open, 
														sale.sellPrice) *100)/100, 
														id: sale.id, 
														lEquity: Math.round(lossEquity*100)/100, 
														tEquity: Math.round(equity*100)/100 }]);
									}
									//console.log("Sell:	" + candle.open + "	time:	" + candle.timestamp );
									sells.remove(sale);
								}
							}
						});									
					}

					cci.result.push(newCCI);
					rsi.result.push(newRSI);
					macd.result.push(newMACD);
					
				}, (err: any, row: any) => {
					data();
				});
			
		});


function percentChg( v1: number, v2: number) :number {
	//console.log(v1);
	//console.log(((v1-v2)/(v2))*100.0);
	return ((v1-v2)/Math.abs(v2))*100.0;
} 

function limitBuy( price:number): number {
	return (price * 1.01)
}

function data() {
	console.log(loss);
	// sells.forEach( order => {
	// 	console.log(order);
	// });
	console.log("num Sells:		" + numSells);
	console.log("num Stop Sell:	" + numStopSell);
	console.log("	num Stop Gain	" + numStopGain);
	console.log("	num Stop Loss	" + numStopLoss);
	profit = (1.001 ** numSells);
	console.log("percent profit:		" + ((profit - 1) * 100));
	let total: number = 0;
	for(let i = 0; i < loss.length ; i++) {
		total += loss[i];
	}
	let avg: number = total / loss.length;
	console.log("avg Loss:		" + avg);
	console.log("equity lost:	" + totalEquityLost);
	console.log("equity			" + equity);
}

class Order {
	public buyPrice: number;
	public sellPrice: number
	public equity:number;
	public tradeStartTime: number;
	public id: string;

	constructor( id: string, bPrice: number, sPrice: number, eqty:number, time: number) {
		this.id = id;
		this.buyPrice = bPrice;
		this.sellPrice = sPrice;
		this.equity = eqty;
		this.tradeStartTime = time;
	}

	public toString() {
		return this.id
	}
}




