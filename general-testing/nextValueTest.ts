import { RSI, CCI, MACD, CandleData } from 'technicalindicators';

var inputRSI = {
  values : [127.75,129.02,132.75,145.40,148.98,137.52,147.38,139.05,137.23,149.30,162.45,178.95,200.35,221.90,243.23,243.52,286.42,280.27,277.35,269.02,263.23,214.90],
  period : 14
};
var expectedResult = [
    86.41,86.43,89.65,86.50,84.96,80.54,77.56,58.06
];

let rsi:RSI = new RSI(inputRSI);

console.log("Before:	"+ rsi.result[rsi.result.length - 1]);
console.log("Next Value:	" +  rsi.nextValue(197));
console.log("After:		" + rsi.result[rsi.result.length - 1]);

console.log("Before:	"+ rsi.result[rsi.result.length - 1]);
console.log("Next Value:	" +  rsi.nextValue(161));
console.log("After:		" + rsi.result[rsi.result.length - 1]);

console.log("Before:	"+ rsi.result[rsi.result.length - 1]);
console.log("Next Value:	" +  rsi.nextValue(1200));
console.log("After:		" + rsi.result[rsi.result.length - 1]);