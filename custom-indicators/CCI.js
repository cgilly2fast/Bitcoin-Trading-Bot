/**********************************************************************;
* Project           : TradingBot, Legion Investments
*
* Program name      : CCI.ts
*
* Author            : Colby Gilbert (colbyg)
*
* Date created      : 20180604
*
* Purpose           : Commodity Channel Index (CCI) is a versatile
*					  indicator that can be used to identify a new trend
*					  or warn of extreme conditions. To be used in
*					  trading logic programs that track the price action
*					  of crypto assests.
*
* Macro Dependency	: Must have a sqlite database named db.sqlite with
*					  price history of per product per exchange that
*					  the user tracks.
*
* Revision History  :
*
* Date        Author      Ref    Revision (Date in YYYYMMDD format)
* 20100818    colbyg      1      Removed subjects with who have not been dosed per spec.
*
|**********************************************************************/
import * as moment from 'moment';
import * as indicator from './Indicator';
import { Big } from "gdax-trading-toolkit/build/src/lib/types";
// Feilds: 	tpArray(BigJS array) =	list of Typical Price values
//			CONST(BigJS) = 				constant used to evenly distribute CCI Values
//			estTpSum(BigJS) =		sum of Typical Price values for fast estimation
//										of CCI values
//			interval(BigJS) = number OHLC candles to include in the indicator 
//									example: 9, 15, 50
//			exchange(string) = Trading exchange the indicator will be created on,
//									not case senstive example GDAX, BITTREX, GEMNI
//			product(string) = the coin-coin pair or coin-currency pair the indicator will be 
//									created on example: BTC-USD 
export class CCI extends indicator.Indicator {
    // 	Constructor for Commodity Channel Index (CCI) object
    //	Paramaters:		interval(number) = number OHLC candles to include in the indactor 
    //										example: 9, 15, 50
    //					exchange(string) = Trading exchange the indicator will be created on,
    //										not case senstive example GDAX, BITTREX, GEMNI
    //					product(string) = the coin-coin pair or coin-currency pair the indicator will be 
    //										created on example: BTC-USD
    constructor(interval, exchange, product) {
        super(interval, exchange, product);
        this.CONST = Big('.015');
    }
    //	Returns:	Typical Price at Unix time specified
    //	Errors:		1. sql error to console if query fails
    //	Paramaters:	time(number Unix date format) = timestamp Typical Price data will be calculated.
    typicalPrice(queryTime) {
        let returnValue;
        this.db.get("SELECT (High + Low + Close) / 3 AS 'TP' FROM $exchangeProduct WHERE Timestamp = $queryTime;", {
            $exchangeProduct: this.exchange.concat(this.product),
        }, (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            returnValue = Big(row.tp);
        });
        return returnValue;
    }
    // 	Returns:	Mean Deviation value of current state of price action
    //	Errors:		1. must pass inputArray if tpSMA is passed.
    //	Parameters:	(optional) inputArray( BigJS array ) = list of Typical Price values
    //				(optional) tpSMA( BigJS ) = pre calclulated Simple Moving Avergae of
    //											passed inputArray.
    meanDeviation(inputArray, tpSMA) {
        if (!inputArray && tpSMA) {
            throw "CCI: meanDeviation(): must pass inputArray if tpSMA is passed.";
        }
        let workingQueue;
        let workingSMA;
        if (inputArray) {
            workingQueue = inputArray;
        }
        else {
            workingQueue = this.tpArray;
        }
        if (tpSMA) {
            workingSMA = tpSMA;
        }
        else {
            let workingSum;
            for (let tp in workingQueue) {
                workingSum = workingSum.plus(tp);
            }
            workingSMA = workingSum.div(this.interval);
        }
        let meanDeviationSum;
        for (let tp in workingQueue) {
            meanDeviationSum = meanDeviationSum.plus((Big(tp).minus(workingSMA)).abs());
        }
        return meanDeviationSum.div(this.interval);
    }
    //	Returns:	Commodity Channel Index value based on Typical Price values
    //				passed in InputArray
    //	Errors:		1.	if inputArray length does not match the indicator's instance
    //					interval
    //	Paramater: 	inputArray(BigJS array) = list of Typical Price values
    calcCCI(inputArray) {
        // Sum Typical Prices in interval
        if (inputArray.length !== this.interval.toNumber()) {
            throw "CCI: calcCCI(): inputArray length does not match the indicator's instance interval";
        }
        let tpSum;
        for (let tp in inputArray) {
            tpSum = tpSum.plus(tp); // *******figure out why this is throwing an errot, possible return values of database are strings
        }
        // Divide to deerive Simple Moving Average Typical Price  
        let tpSMA = tpSum.div(this.interval);
        // Final calculation of CCI 
        return (inputArray[this.interval.minus(1).toNumber()].minus(tpSMA)) / (this.CONST.times(this.meanDeviation(inputArray, tpSMA)));
    }
    //	Returns:	the most Commodity Channel Index value,
    //				calculates new value each call, even if value hasnt changed
    // 	Errors:		1. sql error to console if query fails
    update() {
        this.tpArray = this.tpAtTime(moment().format());
        this.current = this.calcCCI(this.tpArray);
        // sum prev typical prices
        for (let i = 1; i <= this.interval.toNumber() - 1; i++) {
            this.estTpSum = this.estTpSum.plus(this.tpArray[i]);
        }
        return this.current;
    }
    //	Returns: 	estimated Commodity Channel Index value at current price action
    //	Errors: 	1. sql error to console if query fails
    //				2. Exchange/Product of price action canlde does not match indicator
    //	Paramaters: candle(Candle) = object containing forcasted OHLC values for product/exchange
    estimate(candle) {
        if ((candle.getExchange !== this.exchange) || (candle.getProduct !== this.product)) {
            throw "SMA: estimate(): Exchange/Product of price action canlde does not match indicator";
        }
        // calculate current estimate current typcial price for price action
        let tpEstimate = (candle.getOpen.plus(candle.getClose).plus(candle.getHigh).div(3));
        let tpEstimateSMA = (this.estTpSum.plus(tpEstimate)).div(this.interval);
        let meanDeviationSum;
        for (let i = 1; i <= this.interval.toNumber() - 1; i++) {
            meanDeviationSum = meanDeviationSum.plus((this.tpArray[i].minus(tpEstimateSMA)).abs());
        }
        meanDeviationSum = meanDeviationSum.plus((tpEstimate.minus(tpEstimateSMA)).abs());
        const meanDeviation = meanDeviationSum.div(this.interval);
        return ((tpEstimate.minus(tpEstimateSMA)) / (this.CONST.times(meanDeviation)));
    }
    //	Returns: 	list of typical price data from (time - interval ) to (time)
    //	Errors:		1. time paramater must be in ISO 8601 date-time format
    //				2. startTime must have a date-time before current time
    //				3. sql error to console if query fails
    //	Paramaters:	time(string date format) = timestamp of returned CCI data will begin from.
    //											if time is not a an even minute, time will be round down 
    //											to previous minute 
    tpAtTime(time) {
        let momentTime = moment(time, moment.ISO_8601, true);
        if (!momentTime.isValid()) { // checks date format
            console.log("smaFromTime method invalid paramter: startTime must date-time format");
            return;
        }
        if (momentTime.isBefore(moment())) {
            console.log("smaFromTime method invalid paramter: startTime must have a date-time before current time");
            return;
        }
        let tpList;
        let endTime = parseInt(momentTime.format('X'));
        if (endTime % 60 !== 0) {
            let base = endTime % 60;
            endTime += (60 - base);
        }
        const startTime = endTime - ((this.interval.toNumber() - 1) * 60);
        for (let i = startTime; i <= endTime; i += 60) {
            tpList.push(this.typicalPrice(i));
        }
        return tpList;
    }
    //	Returns: 	list of Commodity Channel Index data from time specifed to current 
    //	Errors:		1. time paramater must be in ISO 8601 date-time format
    //				2. startTime must have a date-time before current time
    //				3. sql error to console if query fails
    //	Paramaters:	time(string date format) = timestamp of returned CCI data will begin from.
    //											if time is not a an even minute, time will be round down 
    //											to previous minute 
    fromTime(time) {
        let momentTime = moment(time, moment.ISO_8601, true);
        if (!momentTime.isValid()) { // checks date format
            console.log("smaFromTime method invalid paramter: startTime must date-time format");
            return;
        }
        if (momentTime.isBefore(moment())) {
            console.log("smaFromTime method invalid paramter: startTime must have a date-time before current time");
            return;
        }
        let endTime = parseInt(momentTime.format('X'));
        if (endTime % 60 !== 0) {
            let base = endTime % 60;
            endTime += (60 - base);
        }
        const startTime = endTime - ((this.interval.toNumber() - 1) * 60);
        let tpList = this.atTime();
        for (let i = startTime; i <= endTime; i += 60) {
            tpList.push(this.typicalPrice(i));
        }
        return tpList;
    }
}
