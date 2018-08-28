/**********************************************************************;
* Project           : TradingBot, Legion Investments
*
* Program name      : Indicator.ts
*
* Author            : Colby Gilbert
*
* Date created      : 20180604
*
* Purpose           : Indicator is a versatile class to build out specific 
*					  indicators.  
*					
* Revision History  :
*
* Date        Author      Ref    Revision (Date in YYYYMMDD format) 
* 20100818    smithb      1      Removed subjects with who have not been dosed per spec. 
*
|**********************************************************************/

import * as sqlite3 from 'sqlite3';
import * as candle from './Candle';
import { Big, BigJS} from "gdax-trading-toolkit/build/src/lib/types";


//	Feilds:		interval(BigJS) = number OHLC candles to include in the indicator 
//									example: 9, 15, 50
//				exchange(string) = Trading exchange the indicator will be created on,
//									not case senstive example GDAX, BITTREX, GEMNI
//				product(string) = the coin-coin pair or coin-currency pair the indicator will be 
//									created on example: BTC-USD
//				current(BigJS) = current value of indicator at present moment

export abstract class Indicator {
	protected interval:BigJS;
	protected exchange: string;
	protected product: string;
	protected current: BigJS;
	protected db: any;

	// 	Constructor for Indicator object
	//	Paramaters:		interval(number) = number OHLC candles to include in the indactor 
	//										example: 9, 15, 50
	//					exchange(string) = Trading exchange the indicator will be created on,
	//										not case senstive example GDAX, BITTREX, GEMNI
	//					product(string) = the coin-coin pair or coin-currency pair the indicator will be 
	//										created on example: BTC-USD
	constructor(interval: number, exchange: string, product: string) {
		this.db = new sqlite3.Database('./db.sqlite');
		this.interval = Big(interval);
		this.exchange = exchange;
		this.product = product;
		this.update();
	}

	abstract update(): BigJS;

	//	Returns:	estimated current Indicator value at price action
	//				passed as paramater 
	//	Paramaters: candle(Candle) = object containing forcasted OHLC values for product/exchange
	abstract estimate(candle: candle.Candle): BigJS;

	//	Returns:	tracking interval of Indicator Object
	public get getInterval(): BigJS {
		return this.interval;
	}

	//	Returns:	exchanged tracked in Indicator Object
	public get getExchange(): string {
		return this.exchange;
	}

	//	Returns:	product tracked in Indicator Object
	public get getProduct(): string {
		return this.product;
	}

	// 	Returns:	most current Indicator Value
	public get getCurrent(): BigJS {
		return this.current;
	}
}