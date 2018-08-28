import * as Gdax from 'gdax';
import * as sqlite3 from 'sqlite3';
import * as moment from 'moment';
const MILLIS5MIN:number = 5*60*1000;
//let fs = require('fs');

let db = new sqlite3.Database('./test.db');
let publicClient:any = new Gdax.PublicClient();
let startTime:number = 1515369600;
let now = new Date();
let time:number = (Math.floor(now.getTime() / MILLIS5MIN) * MILLIS5MIN)/1000;
console.log(time);

//console.log( "Start Time:	" + startTime.format() + "	End Time:	" +startTime.add(300, 'm').format());
// let results:any = rates(startTime, endTime);
// console.log(results);

let unfinished:number[] = [635,
636,
637,
638,
639,
640]


for(let i = 1; i < 7; i++) {
	setTimeout( function() {
		//let s = moment( ((unfinished[i]*18000) + startTime).toString() , "X", true);
		//console.log(s);
		let start: number = time - (i * 1500);
		publicClient.getProductHistoricRates(
		'BTC-USD',
		{ 	granularity: 300,
			start: moment(),
			end: moment(start).format()
		},
		(error:any, repsonse:any, data: number[][]) => {
			if(error){
				//console.log(error);
				//console.log(unfinished[i]+",");

			} else {
				console.log("\t");
				//console.log(data);
				console.log("End:	" + data[0][0]);
				console.log("Start:	" + data[data.length-1][0]);
				
            	console.log("Dif:	" + ((data[0][0] - data[data.length-1][0]) ));
				// for(let j = 0; j < data.length; j++) {
					
				// 	// db.run("INSERT INTO TestValues (Timestamp, Open, High, Low, Close, Volume) VALUES ($timestamp, $open, $high, $low, $close, $volume)", {
				// 	// 	$timestamp: data[j][0],
				// 	// 	$low: data[j][1],
				// 	// 	$high: data[j][2],
				// 	// 	$open: data[j][3],
				// 	// 	$close: data[j][4],
				// 	// 	$volume: data[j][5]
				// 	// }, (err:any) => {
				// 	// 	if(err) {
				// 	// 		console.log(err);
				// 	// 	}
				// 	// });
				// }
			}	 
		});}, i*300);
}


