import * as moment from 'moment';
import * as sqlite3 from 'sqlite3';
import { Big, BigJS } from "gdax-trading-toolkit/build/src/lib/types";

export class TypicalPrice {
	private db: any;
	private typicalPrice: BigJS;
	private exchange: string;
	private product: string;

	constructor(exchange: string, product: string, time?: number) {
		if(time) {
			let momentTime = moment(time);
			if(momentTime.isValid()) {
				time = parseInt(momentTime.format('X'));
			} else {
				throw "TypicalPrice: Constructor: invald time format param passed";
			}	
		}
		this.db = new sqlite3.Database('./db.sqlite');
		this.exchange = exchange;
		this.product = product;
		this.typicalPrice = this.update(time);
	}


	private update(queryTime:number):BigJS {
		let returnValue: BigJS;
		this.db.get("SELECT (High + Low + Close) / 3 AS 'TP' FROM $exchangeProduct WHERE Timestamp = $queryTime;", {
			$exchangeProduct: this.exchange.concat(this.product), 
		}, (err: any , row: any) => {
			if(err){
				console.log(err);
				return;
			}

			returnValue = Big(row.tp);
		});
		return returnValue;
	}

	public get getTP() {
		return this.typicalPrice;
	}
}