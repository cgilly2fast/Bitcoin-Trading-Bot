CREATE TABLE Bitcoin1MinCandle( Timestamp INTEGER NOT NULL,     --Time in Unix of indicator calculation(every 1 minute)
                                Open REAL NOT NULL,             --Price at open(beginning) of time interval
                                High REAL NOT NULL,             --Highest price in time interval
                                Low REAL NOT NULL,              --Lowest price in time interval
                                Close REAL NOT NULL,            --Price at Closeing(end) of time interval
                                VolumeBTC REAL NOT NULL,        --Number of bitcoin moved in time interval
                                VolumeUSD REAL NOT NULL,        --Number of fiat currency moved in time interval
                                WieghtedPrice REAL NOT NULL,    --Averaged price across major exchanges
                                PRIMARY KEY(Timestamp));

CREATE TABLE CoinbaseBTCUSD( Timestamp TEXT NOT NULL,    
                                Open REAL NOT NULL,             
                                High REAL NOT NULL,             
                                Low REAL NOT NULL,              
                                Close REAL NOT NULL,           
                                VolumeBTC REAL NOT NULL,        
                                VolumeUSD REAL NOT NULL,        
                                WieghtedPrice REAL NOT NULL,    
                                PRIMARY KEY(Timestamp));

SELECT Timestamp, Open, (   SELECT MAX(High) 
                            FROM CoinbaseBTCUSD 
                            WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600) ) 
                        AS High, 
                        (   SELECT MIN(Low) 
                            FROM CoinbaseBTCUSD 
                            WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600)) 
                        AS Low, 
                        (   SELECT Close 
                            FROM CoinbaseBTCUSD 
                            WHERE Timestamp = 1515369600) 
                        AS Close, 
                        (   SELECT SUM(VolumeBTC) 
                            FROM CoinbaseBTCUSD 
                            WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600)) 
                        AS Volume 
FROM CoinbaseBTCUSD 
WHERE Timestamp = 1433116800;


SELECT Timestamp FROM CoinbaseBTCUSD ORDER BY Timestamp ASC LIMIT 1;
SELECT Timestamp FROM CoinbaseBTCUSD ORDER BY Timestamp DESC LIMIT 2;
SELECT MAX(High) FROM CoinbaseBTCUSD WHERE (Timestamp >= 1420070400) AND (Timestamp <= 1422748740);
SELECT MIN(Low) FROM CoinbaseBTCUSD WHERE (Timestamp >= 1420070400) AND (Timestamp <= 1422748740);
SELECT COUNT(Timestamp) FROM CoinbaseBTCUSD WHERE Timestamp >=1433116800;

CREATE TABLE CoinbaseBTCUSD15Min( Timestamp TEXT NOT NULL,    
                                Open REAL NOT NULL,             
                                High REAL NOT NULL,             
                                Low REAL NOT NULL,              
                                Close REAL NOT NULL,           
                                VolumeBTC REAL NOT NULL,           
                                PRIMARY KEY(Timestamp));

CREATE TABLE CoinbaseBTCUSD5Min( Timestamp TEXT NOT NULL,    
                                Open REAL NOT NULL,             
                                High REAL NOT NULL,             
                                Low REAL NOT NULL,              
                                Close REAL NOT NULL,           
                                VolumeBTC REAL NOT NULL,           
                                PRIMARY KEY(Timestamp));
SELECT Timestamp, Open, (  SELECT MAX(High) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600) ) AS High, (  SELECT MIN(Low) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600)) AS Low, (  SELECT Close FROM CoinbaseBTCUSD5Min WHERE Timestamp = 1515369600) AS Close, (  SELECT SUM(VolumeBTC) FROM CoinbaseBTCUSD5Min WHERE (Timestamp >= 1433116800) AND (Timestamp <= 1515369600)) AS Volume FROM CoinbaseBTCUSD5Min WHERE Timestamp = 1433116800;


DROP TABLE CoinbaseBTCUSD5Min;
SELECT * FROM CoinbaseBTCUSD5Min;
SELECT * FROM CoinbaseBTCUSD ORDER BY Timestamp ASC LIMIT 1;
SELECT * FROM CoinbaseBTCUSD ORDER BY Timestamp DESC LIMIT 2;
SELECT CoinbaseBTCUSD5min.Timestamp, Open, High, Close, RSI, CCI, MACD, HistogramMACD FROM CoinbaseBTCUSD5min  INNER JOIN IndicatorValues ON CoinbaseBTCUSD5min.Timestamp = IndicatorValues.Timestamp LIMIT 5;
SELECT * FROM CoinbaseBTCUSD5min WHERE (Timestamp >= 1512086400) AND (Timestamp <= 1512172800)

CREATE TABLE TestValues( Timestamp TEXT NOT NULL,    
                                Open REAL NOT NULL,             
                                High REAL NOT NULL,             
                                Low REAL NOT NULL,              
                                Close REAL NOT NULL,           
                                Volume REAL NOT NULL,            
                                PRIMARY KEY(Timestamp));

SELECT * FROM TestValues ORDER BY Timestamp DESC LIMIT 1;

CREATE TABLE VarTest3 ( StopDays REAL NOT NULL, 
                        TargetGain REAL NOT NULL, 
                        Strictness REAL NOT NULL, 
                        Equity REAL NOT NULL, 
                        EquityLost REAL NOT NULL, 
                        NumSells REAL NOT NULL, 
                        NumStopSells REAL NOT NULL, 
                        NumStopLoss REAL NOT NULL, 
                        AvgLoss REAL NOT NULL, 
                        NumStopGain REAL NOT NULL, 
                        AvgGain REAL,
                        PRIMARY KEY(StopDays, TargetGain, Strictness));
SELECT Open FROM 

CREATE TABLE IndicatorValues5Min(   Timestamp Text NOT NULL,
                                    RSI NUMBER NOT NULL,
                                    CCI NUMBER NOT NULL,
                                    MACD NUMBER NOT NULL,
                                    HistogramMACD NUMBER NOT NULL,
                                    PRIMARY KEY(Timestamp));
SELECT count(Timestamp) FROM IndicatorValues5Min;

CREATE TABLE IndicatorValues(   Timestamp Text NOT NULL,
                                    RSI NUMBER NOT NULL,
                                    CCI NUMBER NOT NULL,
                                    MACD NUMBER NOT NULL,
                                    HistogramMACD NUMBER NOT NULL,
                                    PRIMARY KEY(Timestamp));


SELECT count(Timestamp) FROM IndicatorValues;
SELECT * FROM IndicatorValues;
DROP TABLE IndicatorValues;
SELECT Timestamp FROM IndicatorValues ORDER BY Timestamp DESC LIMIT 1;
SELECT * FROM IndicatorValues LIMIT 1000;



    -- Functional Dependencies
    -- Timestamp -> Open, High, Low, Close, VolumeBTC, VolumeUSD, WieghtedPrice
                                
    -- Most Used Query Example:
    -- SELECT Close 
    -- FROM Bitcoin1MinCandle 
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1;
    
    -- SELECT SUM(Close) 
    -- FROM Bitcoin1MinCandle 
    -- ORDER BY Timestamp ASC 
    -- LIMIT 19; 
    
    -- INSERT TO Bitcon1MinCandle
    -- VALUES(1516914040, 12345.67, 12345.67, 12345.67, 12345.67, 100, 1000000, 12345.67);
                                
CREATE TABLE 20cciIndicator(    Timestamp INTEGER  NOT NULL, 	--Time in Unix of indicator calculation(every 1 minute)
                                TypicalPrice REAL NOT NULL,	    --Sudo-average price of last price period example =(High+Low+Close)/3
                                MeanDeviation REAL  NOT NULL,	--Mean price deviation from TypicalPice see CCI link
                                CCI REAL  NOT NULL,		        --Commodity Channel Index 
                                PRIMARY KEY(Timestamp),
                                FOREIGN KEY(Timestamp) REFERENCES  Bitcoin1MinCandle(Timestamp));

    -- Functional Dependencies
    -- Timestamp -> TypicalPrice, MeanDeviation, CCI

    -- *if I added a Column for the 20 period simple moving average of TypicalPrice then
    -- TypicalPrice, 20smaTP, MeanDeviation -> CCI would hold true but how I plan on using 
    -- the table doesnt seem to necesitate that column so I have left it out
    

                                
    -- Highest Use Query Example:
    -- SELECT CCI 
    -- FROM 20cciIndicator 
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1;
    
    -- INSERT TO 20cciIndicator, 
    -- VALUES(1516914040, .55, -112);
                                
CREATE TABLE  14rsiIndicator(   Timestamp INTEGER NOT NULL,	--Time in Unix of indicator calculation(every 1 minute)
                                Change REAL NOT NULL, 		--Delta price form last closing price to current closing price
                                Gain REAL NOT NULL,		    --If change was positive then it is listed here else 0 is listed
                                Loss REAL NOT NULL,		    --If change was negative then it is listed here else 0 is listed
                                AverageGain REAL NOT NULL,	--average gain of last 14 price periods see rsi link for more detail
                                AverageLoss REAL NOT NULL,	--average loss of last 14 price periods see rsi link for more detail
                                RS REAL NOT NULL,		    --Value used to calculate smoothed RS
                                RSI REAL NOT NULL,		    --Smoothed RS
                                PRIMARY KEY(Timestamp),
                                FOREIGN KEY(Timestamp) REFERENCES  Bitcoin1MinCandle(Timestamp));

    -- Functional Dependencies
    -- Timestamp -> Change, Gain, Loss, AverageGain, AverageLoss, RS, RSI
    -- Change -> Gain, Loss
    -- AverageGain, AverageLoss -> RS
    -- RS -> RSI
    
    -- Highest Use Query Example:
    -- SELECT RSI 
    -- FROM 14rsiIndicator
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1;
    
    -- SELECT AverageGain
    -- FROM 14rsiIndicator
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1;
    
    -- SELECT AverageLoss 
    -- FROM 14rsiIndicator
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1;
    
    -- INSERT TO 20rsiIndicator, 
    -- VALUES(1516914040, -1, 0, -1, .54, .53, 2, 33);

CREATE TABLE macdIndicator( Timestamp INTEGER NOT NULL,	    --Time in Unix of indicator calculation(every 1 minute)
                            SignalLine REAL NOT NULL, 	    --8 period ema of the MACDLine
                            MACDLine REAL NOT NULL,	        --difference between the 15periodEMA and 30periodEMA 
                                                            --example = 15periodEMA 30periodEMA
                            Histogram REAL NOT NULL,	    --difference between the signalLine and MACDline 
                                                            --example = signalLine -MACDline
                            PRIMARY KEY(Timestamp),
                            FOREIGN KEY(Timestamp) REFERENCES  Bitcoin1MinCandle(Timestamp));

    -- Functional Dependencies
    -- Timestamp -> SignalLine, MACDLine, Histogram
    -- SignalLine, MACDLine -> Histogram
    
    -- Highest Use Query Example:
    -- SELECT * 
    -- FROM macdIndicator
    -- ORDER BY Timestamp ASC 
    -- LIMIT 1; 
    
    -- INSERT TO macdIndicator, 
    -- VALUES(1516914040, 30, 26, -4);
                            

CREATE TABLE ExponentialMovingAverages( Timestamp INTEGER NOT NULL,
                                        15ema REAL NOT NULL,	--Wieghted average of the last 15 OHLC periods
                                        30ema REAL NOT NULL,	--Wieghted average of the last 30 OHLC periods
                                        50ema REAL NOT NULL,	--Wieghted average of the last 50 OHLC periods
                                        100ema REAL NOT NULL,	--Wieghted average of the last 100 OHLC periods
                                        200ema REAL NOT NULL,	--Wieghted average of the last 200 OHLC periods
                                        PRIMARY KEY(Timestamp),
                                        FOREIGN KEY(Timestamp) REFERENCES  Bitcoin1MinCandle(Timestamp));

    -- Functional Dependencies
    -- Timestamp -> 15ema, 30ema, 50ema, 100ema, 200ema

    -- Highest Use Query Example:
    -- SELECT 15ema, 30ema    
    -- FROM ExponentialMovingAverages
    -- ORDER BY Timestamp ASC
    -- LIMIT 1;

    -- INSERT TO ExponentialMovingAverages, 
    -- VALUES(1516914040, 12345.67, 12345.67, 12345.67, 12345.67, 12345.67, 12345.67);                                       