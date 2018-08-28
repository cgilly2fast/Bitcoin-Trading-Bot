/**********************************************************************;
* Project           : TradingBot, Legion Investments
*
* Program name      : SMA.ts
*
* Author            : Colby Gilbert
*
* Date created      : 20180604
*
* Purpose           : Index (CCI) is a versatile indicator that can be 
*					  used to identify a new trend or warn of extreme 
*					  conditions. To be used in trading logic programs
*					  that track the price action of crypto assests.
*
* Macro Dependency	: Must have a sqlite database named db.sqlite with
*					  price history of per product per exchange that 
*					  the user tracks.  
*					
* Revision History  :
*
* Date        Author      Ref    Revision (Date in YYYYMMDD format) 
* 20100818    smithb      1      Removed subjects with who have not been dosed per spec. 
*
|**********************************************************************/

import * as moment from 'moment';
import * as indicator from './Indicator';
import * as candle from './Candle';
import { Big, BigJS, ZERO} from "gdax-trading-toolkit/build/src/lib/types";

// Feilds:	estTpSum(BigJS) =	sum of Typical Price values for fast estimation
//									of CCI values
//			interval(BigJS) = 	number OHLC candles to include in the indicator 
//									example: 9, 15, 50
//			exchange(string) = 	Trading exchange the indicator will be created on,
//									not case senstive example GDAX, BITTREX, GEMNI
//			product(string) = 	the coin-coin pair or coin-currency pair the indicator will be 
//									created on example: BTC-USD 

export class SMA extends indicator.Indicator {

	private estSum: BigJS;
	
	// 	Constructor for Simple Moving Average object
	//	Feilds:		interval(number) = number OHLC candles to include in the indactor 
	//									example: 9, 15, 50
	//				exchange(string) = Trading exchange the indicator will be created on,
	//									not case senstive example GDAX, BITTREX, GEMNI
	//				product(string) = the coin-coin pair or coin-currency pair the indicator will be 
	//									created on example: BTC-USD 
	constructor(interval: number, exchange: string, product: string) {
		super(interval, exchange, product);

	}

	//	Returns: 	list of Simple Moving Average values from time specifed to present 
	//	Errors:		1. time paramater must be in ISO 8601 date-time format
	//				2. startTime must have a date-time before current time
	//				3. sql error to console if query fails
	//				smaFromTime method invalid paramter: startTime must be in date format
	//	Paramaters:	time(string date format) = timestamp of returned sma data will begin from
	//											if time is not a an even minute, time will be round down 
	//											to next minute 
	public fromTime(time: string): BigJS[] {
		// check date for format
		let momentTime = moment(time, moment.ISO_8601, true);
		if(!momentTime.isValid()) { 
			console.log("smaFromTime method invalid paramter: startTime must date-time format");
			return;
		}

		if( momentTime.isBefore( moment() ) ) {
			console.log("smaFromTime method invalid paramter: startTime must have a date-time before current time");
			return;
		}

		// create starting to be used in for loop
		let startTime: number = parseInt( momentTime.format('X') ); // to unix time

		// round down to nearest minute 
		if( startTime % 60 !== 0) {
			let base:number = startTime % 60;
			startTime += (60 - base); 
		}

		// create end time to used in for loop
		let currentMinute: number = new Date().getTime() / 1000; // calculate prev minute closing to unix
		let smaResults: BigJS[];

		// retrieve SMA value for each minute from startTime to CurrentMinute 
		for( let i = startTime; i <= currentMinute; i += 60) {
			smaResults.push(this.retrieveSMA(i));
		}

		return smaResults;

	}

	//	Returns: 	single Simple Moving Average data for time specifed 
	//	Errors:		1. time paramater must be in ISO 8601 date-time format
	//				2. startTime must have a date-time before current time
	//				3. sql error to console if query fails
	//	Paramaters:	time(string date format) = timestamp of desired sma value
	//											if time is not a an even minute, 
	//											time will be round down to previous
	//											minute.
	public atTime(time: string):BigJS {

		let momentTime = moment(time, moment.ISO_8601, true);
		if(!momentTime.isValid()) { // check date format
			console.log("smaFromTime method invalid paramter: startTime must date-time format");
			return;
		}

		if( momentTime.isBefore( moment() ) ) {
			console.log("smaFromTime method invalid paramter: startTime must have a date-time before current time");
			return;
		}

		let startTime: number = parseInt( momentTime.format('X') ); // to unix time

		if( startTime % 60 !== 0) {
			let base:number = startTime % 60;
			startTime -= base; 
		}
		return this.retrieveSMA(startTime);
	}

	//	Returns:	the most current Simple Moving Average value,
	//				calculates new value each call, even if value hasnt changed
	// 	Errors:		1. sql error to console if query fails
	public update() {
		this.estSum = Big(ZERO);

		let momentTime = moment();

		// round down present time to most recent minute 
		let currentTime:number = parseInt( momentTime.format('X') );
		 
		if( currentTime % 60 !== 0) {
			let base:number = currentTime % 60;
			currentTime -= base; 
		}

		// set startime so query only in includes interval - 1 Close indexes
		// example: interval = 20, num of sum values = 19 (fence post problem) 
		let startTime:number = currentTime - ((this.interval.toNumber() - 2) * 60);

		this.db.get("SELECT SUM(Close) FROM $exchangeProduct WHERE Timestamp >= $startTime AND Timestampe <= $endTime", {
				$exchageProduct: this.exchange.concat(this.product), // check concactination of strings in node
				$startTime: startTime,
				$endTime: currentTime
			}, (err: any, row: any) => {
				if(err) {
					console.log(err);
					return;
				}

				this.estSum = this.estSum.plus(Big(row.Close));
			});

		// update current feild
		this.current = this.atTime( moment().format());
		return this.current;
	}

	//	Returns: 	estimated Simple Moving Average value at current price action
	//	Errors: 	1. sql error to console if query fails
	//				2. Exchange/Product of price action canlde does not match indicator
	//	Paramaters: candle(Candle) = object containing forcasted OHLC values for product/exchange
	public estimate(candle: candle.Candle):BigJS {
		if(candle.getExchange !== this.exchange || candle.getProduct !== this.product) {
			throw "SMA: estimate(): Exchange/Product of price action canlde does not match indicator"
		}
		
		this.estSum.plus(candle.getClose)

		return  this.estSum.div(this.interval) ;
	}

	//	Returns:	Simple Moving Average of the time passed 
	//	Errors:		1. sql error to console if query fails
	//	Paramaters:	time(number Unix date format) = timestamp sma date data will be calculated.
	private retrieveSMA(time:number): BigJS {
		let returnValue:BigJS;
		this.db.get("SELECT AVG(Close) AS sma FROM $exchangeProduct WHERE Timestamp >= ($queryTime - ($interval * 60) AND Timestamp <= $queryTime", {
			$exchageInterval: this.exchange.concat(this.product), // check concactination of strings in node
			$interval: this.interval.toNumber(),
			$queryTime: time
		}, (err: any, row: any) => {
			if(err) {
				console.log(err);
				return;
			}

			returnValue = Big(row.sma);
		});

		return returnValue;
	}
}	
