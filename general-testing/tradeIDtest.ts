import * as sqlite3 from 'sqlite3';

import * as moment from 'moment';
let db = new sqlite3.Database('./test.db');

let tradeID: string;
db.get("SELECT TradeID FROM Trades ORDER BY TradeID DESC LIMIT 1;",
    (err: any, row: any) => {
        if(err){
            //insert into err db
            console.log(err);
        }

        if(row == null) {
            tradeID = "10000";
        } else {
            tradeID = row.TradeID;
        }
    });

