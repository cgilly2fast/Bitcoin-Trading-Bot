"use strict";
exports.__esModule = true;
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('./test.db');
var startTime = 1433116800;
var endTime = 1433117040; //1515369600;
for (var i = startTime; i < endTime; i += 300) {
    db.get("SELECT Timestamp, Open, (  SELECT MAX(High) FROM CoinbaseBTCUSD WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime) ), (  SELECT MIN(Low) FROM CoinbaseBTCUSD WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime)), (  SELECT Close FROM CoinbaseBTCUSD WHERE Timestamp = $endTime), (  SELECT SUM(VolumeBTC) FROM CoinbaseBTCUSD WHERE (Timestamp >= $startTime) AND (Timestamp <= $endTime)) FROM CoinbaseBTCUSD WHERE Timestamp = $startTime;", {
        $startTime: i,
        $endTime: (i + 240)
    }, function (err, row) {
        if (err) {
            console.log(err);
        }
        console.log(row);
        // db.run(	"INSERT INTO CoinbaseBTCUSD5Min (Timestamp, Open, High, Low, Close, VolumeBTC) VALUES ("
        // 		+ "$Timestamp, $open, $high, $low, $close, $volume);", {
        // 			$Timestamp: row.Timestamp,
        // 			$open: row.Open,
        // 			$high: row.High,
        // 			$low: row.Low,
        // 			$close: row.Close,
        // 			$volume: row.Volume
        // 		}, (err:any) => {
        // 			if(err) {
        // 				console.log(err);
        // 			}
        // 		});
    });
}
