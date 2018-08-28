
import * as Gdax from 'gdax';
import * as moment from 'moment';


const publicClient:any = new Gdax.PublicClient();
const gran: number = 300;
const pdt = 'BTC-USD';
const MILLIS5MIN:number = 5*60*1000;

let now = new Date();
let time:number = (Math.floor(now.getTime() / MILLIS5MIN) * MILLIS5MIN)/1000;
console.log("Time: " + time);
// console.log();
// let s = moment(time.toString(), "X", true);
// console.log(moment(time.toString(), "X", true).format());
// s.subtract(3*90000, "second");
// console.log(moment((time + (299 * gran)).toString(), "X", true).format());


// publicClient.getProductHistoricRates(pdt,
// 	        {   granularity: gran,
// 	            start: moment(time.toString(), "X", true).format(),
// 	            end: moment((time + (299 * gran)).toString(), "X", true).format()
// 	        },
// 	        (error:any, response:any, data: number[][]) => {
// 	            if(error) {
// 	                console.log(error);
// 	                return;
// 	            }
// 	            console.log(data);
// 	        });    
let periods: number = 12
let totalData:number[][] = [];
let intialStart = (time - (300 * gran * (periods-1) )) -(299*300);

const candleMap = new Map();
let timeOut: number = 1;
for(let i = periods; i >= 1; i-- ){
	setTimeout( () => {
		let endTime = time - (300 * gran * (i-1) );
		let extra: number;
		if(i == 1) {
			extra = 300;
		} else {
			extra = 0;
		}
		publicClient.getProductHistoricRates(pdt,
	        {   granularity: gran,
	            start: moment( (endTime-(299*300) + extra ).toString(), "X", true).format(),//((i-1)*300)
	            end: moment((endTime +300).toString(), "X", true).format()
	        },
	        (error:any, repsonse:any, data: number[][]) => {
	            if(error) {
	                console.log(error);
	                return;
	            }

	            for(let j = (data.length - 1); j >= 0 ; j--) {
	            	candleMap.set(data[j][0], data[j]);
	            }
	            console.log("\t");
				//console.log(data);
				console.log("End:	" + data[0][0]);
				console.log("Start:	" + data[data.length-1][0]);
				console.log("Num Candles:	" + data.length);
	        });
	}, timeOut*800);
	timeOut++;
}

setTimeout( () => {
	candleMap.forEach( (key: string, value: any, may: any) => {
		if(parseInt(value[0]) != intialStart){
			console.log("out of order");
		}
		intialStart += 300;
	});
		
	setTimeout( () => {
		console.log(intialStart);
	},4000);	
	console.log("Total Num Candles	" +candleMap.size);
}, 15*1000);
//console.log(time);
// let total = histData( (time - (300 * gran * 7) + gran), time, gran, pdt);

// setTimeout(() => {
// 	console.log(total);
// }, 15*1000)

// function histData(startTime:number, endTime: number, gran: number, pdt:string ):any {
// 		publicClient.getProductHistoricRates(pdt,
// 	        {   granularity: gran,
// 	            start: moment(time.toString(), "X", true).format(),
// 	            end: moment((time + (299 * gran)).toString(), "X", true).format()
// 	        },
// 	        (error:any, repsonse:any, data: any) => {
// 	            if(error) {
// 	                console.log(error);
// 	                return;
// 	            }

// 	            console.log(startTime);
// 	            console.log(startTime + (299 * gran));

// 	            if( data[0][0] >= endTime) {
// 	            	return data;
// 	            } else {
	            	
// 	            		return data.concat( histData(data[data.length-1][0], data[data.length-1][0] + (299 * gran), gran, pdt));
	            		
// 	            }
// 	        });
// }	          
