CREATE TABLE BuyReceipts(   OrderID INTEGER NOT NULL UNIQUE,	--ID of specific order
                            TradeID INTEGER NOT NULL,		    --ID of trade that I make Buy + Sell = Trade
                            BuySubmitTime INTEGER NOT NULL,	    --Unix time I submitted the trade to the exchange
                            BuyFillTime INTEGER NOT NULL,	    --Unix time my oder was filled
                            Type VARCHAR(6) NOT NULL,	    	--Type of order example "limit" "stop" "market"
                            Size REAL NOT NULL,		         	--Number of coin bought
                            Price REAL NOT NULL,	         	--Exchange rate from coin to fiat currency example $14,221.23 per 1 BTC
                            Cost REAL NOT NULL,		        	--fait currency amount used to place buy coin
                            PRIMARY KEY(OrderID, TradeID),
                            FOREIGN KEY(TradeID) REFERENCES  Trades(TradeID));

    -- Functional Dependencies
    -- OrderID, TradeID -> BuySubmitTime, BuyFillTime, Type, Size, Price, Cost
    -- Size, Price -> Cost
                            
    -- Highest Use Query Example:
    -- INSERT TO BuyReceipts 
    -- VALUES(1516914040, 1234567, 1234567, 1516915000, 1516916000, "limit", 10, 14414.23, 1100.24);
                                
CREATE TABLE SellReceipts(  OrderID INTEGER NOT NULL UNIQUE, 	--ID of specific order 
                            TradeID INTEGER NOT NULL,		    --ID of trade that I make Buy + Sell = Trade
                            SellSubmitTime INTEGER NOT NULL,	--Unix time I submitted the trade to the exchange
                            SellFillTime INTEGER NOT NULL,	    --Unix time my oder was filled
                            Type VARCHAR(6) NOT NULL,	    	--Type of order example "limit" "stop" "market"
                            Size REAL NOT NULL,			        --Number of coin sold
                            Price REAL NOT NULL,	        	--Exchange rate from coin to fiat currency example $14,221.23 per 1 BTC
                            Return REAL NOT NULL,	    	    --fait currency amount returned after sale
                            PRIMARY KEY(OrderID, TradeID)
                            FOREIGN KEY(TradeID) REFERENCES  Trades(TradeID));

    -- Functional Dependencies
    -- OrderID, TradeID -> SellSubmitTime, SellFillTime, Type, Size, Price, Return
    -- Size, Price -> Return
                            
                                
    -- Highest Use Query Example:
    -- INSERT TO BuyReceipts 
    -- VALUES(1516914040, 1234567, 1234567, 1516915000, 1516916000, "limit", 10, 14414.23, 1200.24);
                                
CREATE TABLE Trades(    TradeID INTEGER NOT NULL,               --Number relating Buy orders to Sell Orders
                        ProductID VARCHAR(7) NOT NULL,          --Product Traded example "BTC-USD"
                        ExchangeID VARCHAR(10) NOT NULL,        --Exchange the trade took place example "GDAX"
                        PRIMARY KEY(TradeID));

    -- Functional Dependencies
    -- TradeID -> ProductID, ExchangeID

    -- Highest Use Query Example:
    -- INSERT TO Trades 
    -- VALUES(1234567, "BTC-USD","GDAX");

    -- SELECT TradeID
    -- FROM Trades
    -- ORDER BY TradeID ASC
    -- LIMIT 1;
                                
CREATE TABLE UnexecutedBuys(    Timestamp INTEGER NOT NULL,         --Time in Unix trade would have executed
                                ProductID VARCHAR(7) NOT NULL,      --Product Traded example "BTC-USD"
                                ExchangeID VARCHAR(10) NOT NULL,    --Exchange the trade took place example "GDAX"
                                PRIMARY KEY(Timestamp));

    -- Functional Dependencies
    -- Timestamp -> ProductID, ExchangeID
                                
    -- Highest Use Query Example:
    -- INSERT TO UnexecutedBuys 
    -- VALUES(1234567, "BTC-USD","GDAX");
                                