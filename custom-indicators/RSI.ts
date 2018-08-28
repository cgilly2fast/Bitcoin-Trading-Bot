/**********************************************************************;
* Project           : TradingBot, Legion Investments
*
* Program name      : RSI.ts
*
* Author            : Colby Gilbert (colbyg)
*
* Date initialized  : 20180407
*
*
* Purpose           : Relative Strength Index (RSI) is a momentum 
*					  oscillator that measures the speed and change of 
*					  price movements. To be used in trading logic 
*					  programs that tracks the price action of crypto
*					  assests.
*
* Macro Dependency	: Must have a sqlite database named db.sqlite with
*					  price history of per product per exchange that 
*					  the user tracks.  
*					
* Revision History  :
*
* Date        Author      Ref    Revision (Date in YYYYMMDD format) 
* 20180407    colbyg      1      Begun creating sketelon of all methods 
*								 to be implemented and defined with 
*								 comments.
*
|**********************************************************************/

import * as moment from 'moment';
import * as indicator from './Indicator';
import * as candle from './Candle';
import { Big, BigJS, ONE} from "gdax-trading-toolkit/build/src/lib/types";
import * as 

// Feilds:	avgGain(BigJS) 	= average of price intervals that where positive in
//								indicator interval 	
//			avgLoss(BigJS) 	= average of price intervals that where negative in
//								indicator interval
//			CONST(BigJS)	= constant used in rsi 
//			interval(BigJS) = number OHLC candles to include in the indicator 
//								example: 9, 15, 50
//			exchange(string)= Trading exchange the indicator will be created on,
//								not case senstive example GDAX, BITTREX, GEMNI
//			product(string) = the coin-coin pair or coin-currency pair the indicator will be 
//								created on example: BTC-USD 
export class RSI extends indicator.Indicator {

	private avgGain: BigJS;
	private avgLoss: BigJS;
	private HUNDRED: BigJS = Big("100");

	// 	Constructor for Relative Strength (RSI) object
	//	Paramaters:		interval(number) = number OHLC candles to include in the indactor 
	//										example: 9, 15, 50
	//					exchange(string) = Trading exchange the indicator will be created on,
	//										not case senstive example GDAX, BITTREX, GEMNI
	//					product(string) = the coin-coin pair or coin-currency pair the indicator 
	//										 will becreated on example: BTC-USD
	constructor(interval: number, exchange: string, product: string) {
		super(interval, exchange, product);

		
		
	}

	private smoother() {
		let momentTime = moment(new Date(), moment.ISO_8601, true);
		momentTime.floor( 1, 'minute' );
		let endTime: number = parseInt( momentTime.format('X') );
		momentTime.subtract( 250, 'minutes');
		momentTime.floor( 1, 'minute' );
		momentTime.format('X');
		let prevClose:number;
		let firstAvgGain:number;
		let firstAvgLoss: number;

		this.db.each("SELECT Close FROM $exchangeProduct WHERE Timestamp >= $startTime AND Timestamp <= $endTime;", {
			$exchageInterval: this.exchange.concat(this.product),
			$startTime: ,
			$endTime: entTime
		}, (err: any, row: any) {
			if(err) {
				console.log(err)
				return;
			}
			if(prevClose) {
				prevClose = row.Close;
			} else {
				let change:number = row.Close - prevClose;
				

			}
		});
		

		 
 	}

	// 	Returns:	Calculates new Relative Strength Index Value at passed paramters
	//	Errors:		
	//	Paramaters:	
	// public calcRSI(): BigJS {
	// 	return
	// }

	//	Returns:	the most recent Relative Strength Index value,
	//				calculates new value each call, even if value hasnt changed
	// 	Errors:		1. sql error to console if query fails
	public update(): BigJS {
		return
	}

	//	Returns: 	estimated Commodity Channel Index value at current price action
	//	Errors: 	1. sql error to console if query fails
	//				2. Exchange/Product of price action canlde does not match indicator
	//	Paramaters: candle(Candle) = object containing forcasted OHLC values for product/exchange
	public estimate(candle: candle.Candle): BigJS {
		return
	}

	// 	Returns:	estimated average loss at current price action
	//	Errors:		1. Exchange/Product of price action canlde does not match indicator
	//	Paramaters:	candle(Candle) = object containing forcasted OHLC values for product/exchange	
	public averageLoss(candle: candle.Candle): BigJS {
		if( (candle.getExchange !== this.exchange) || (candle.getProduct !== this.product) ) {
			throw "SMA: estimate(): Exchange/Product of price action canlde does not match indicator"
		}

		return 
	}

	// 	Returns:	estimated average gain at current price action
	//	Errors:		1. Exchange/Product of price action canlde does not match indicator
	//	Paramaters:	candle(Candle) = object containing forcasted OHLC values for product/exchange	
	public averageGain(candle: candle.Candle): BigJS {
		if( (candle.getExchange !== this.exchange) || (candle.getProduct !== this.product) ) {
			throw "SMA: estimate(): Exchange/Product of price action canlde does not match indicator"
		}

		return
	}
	// Returns:		Relative strength at given average gain divided by average loss
	public rs( avgGain: BigJS, avgLoss: BigJS) {
		return avgGain.div(avgLoss);
	}

	// 	Returns:	Calculates new Relative Strength Index Value (normalized relative strength) 
	//	Errors:		
	//	Paramaters: relativeStrength(BigJS) = calculated value based on previous price action 
	//										   movements.
	public rsi( relativeStrength: BigJS): BigJS {
		return this.HUNDRED.minus( (this.HUNDRED.div( (ONE.minus(relativeStrength)) )) );
	}

	//	Returns: 	list of Relative Strength Values from time specifed to present 
	//	Errors:		1. time paramater must be in ISO 8601 date-time format
	//				2. startTime must have a date-time before current time
	//				3. sql error to console if query fails
	//				smaFromTime method invalid paramter: startTime must be in date format
	//	Paramaters:	time(string date format) = timestamp of returned sma data will begin from
	//											if time is not a an even minute, time will be round down 
	//											to next minute 
	public fromTime(time: string): BigJS[] {
		return
	}

	//	Returns: 	single Relative Strength Index value for time specifed 
	//	Errors:		1. time paramater must be in ISO 8601 date-time format
	//				2. startTime must have a date-time before current time
	//				3. sql error to console if query fails
	//	Paramaters:	time(string date format) = timestamp of desired rsi value.
	//											if time is not a an even minute, 
	//											time will be round down to previous
	//											minute.
	public atTime(time:string): BigJS {

		let momentTime = moment(time, moment.ISO_8601, true);
		if(!momentTime.isValid()) { // checks date format
			console.log("smaFromTime method invalid paramter: startTime must date-time format");
			return;
		}

		if( momentTime.isBefore( moment() ) ) {
			console.log("smaFromTime method invalid paramter: startTime must have a date-time before current time");
			return;
		}


		return
	}

	public get getAvgGain() {
		return this.avgGain;
	}

	public get getAvgLoss() {
		return this.avgLoss;
	}
}