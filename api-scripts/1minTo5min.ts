import * as sqlite3 from 'sqlite3';
let db = new sqlite3.Database('./test.db');
let startTime:number = 1433116800;
let endTime: number =  1515369600;

for( let i = startTime ; i < endTime; i+= 300 ) {

	db.get("SELECT Timestamp, Open, (  SELECT MAX(High) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime) ) AS High, (  SELECT MIN(Low) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime)) AS Low, (  SELECT Close FROM CoinbaseBTCUSD5Min WHERE Timestamp = $endTime) AS Close, (  SELECT SUM(VolumeBTC) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime)) AS Volume FROM CoinbaseBTCUSD5Min WHERE Timestamp = $startTime;", {
    	$startTime: i,
    	$endTime: (i + 240)
    }, (err:any, row:any) => {
    	if(err){
    		console.log(err);
    	}
    	//console.log(row);

    	db.run(	"INSERT INTO CoinbaseBTCUSD15Min (Timestamp, Open, High, Low, Close, VolumeBTC) VALUES ("
    			+ "$Timestamp, $open, $high, $low, $close, $volume);", {
    				$Timestamp: row.Timestamp,
    				$open: row.Open,
    				$high: row.High,
    				$low: row.Low,
    				$close: row.Close,
    				$volume: row.Volume

    			}, (err:any) => {
    				if(err) {
    					console.log(err);

    				}
    			});
    });
}