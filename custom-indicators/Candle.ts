/**********************************************************************;
* Project           : TradingBot, Legion Investments
*
* Program name      : Candle.ts
*
* Author            : Colby Gilbert
*
* Date created      : 20180604
*
* Purpose           : Standardized Price action candle for all exchanges 
*					  To be used in trading logic programs that track  
*					  theprice action of crypto assests.
*					
* Revision History  :
*
* Date        Author      Ref    Revision (Date in YYYYMMDD format) 
* 20100818    smithb      1      Removed subjects with who have not been dosed per spec. 
*
|**********************************************************************/

import * as moment from 'moment';
import { BigJS} from "gdax-trading-toolkit/build/src/lib/types";

export class Candle {
	private open: BigJS;
	private high: BigJS;
	private low: BigJS;
	private close: BigJS;
	private time: string;
	private duration: string;
	private volume: BigJS;
	private exchange: string;
	private product: string;

	constructor(	open: BigJS, high: BigJS, low: BigJS, close: BigJS, exchange: string, 
					product: string, duration?: string,time?: string, ) {
		if(time) {
			let momentTime = moment(time);
			if(momentTime.isValid()) {
				this.time = momentTime.format();
			} else {
				throw "Candle: Constructor: invald time format param passed";
			}	
		} else {
			this.time = moment().format();
		}

		if(duration) {
			this.duration = duration;
		} else {
			this.duration = "1m";
		}

		this.open = open;
		this.high = high;
		this.low = low;
		this.close = close;
		this.exchange = exchange;
		this.product = product;
	}

	public get getOpen(): BigJS {
		return this.open;
	}

	public get getHigh(): BigJS {
		return this.high;
	}

	public get getLow(): BigJS {
		return this.low;
	}

	public get getClose(): BigJS {
		return this.close;
	}

	public get getTimestamp(): string {
		return this.time;
	}

	public get getDuration(): string {
		return this.duration
	}

	public get getVolume(): BigJS {
		return this.volume;
	}

	public get getExchange(): string {
		return this.exchange;
	}

	public get getProduct(): string {
		return this.product;
	}
}