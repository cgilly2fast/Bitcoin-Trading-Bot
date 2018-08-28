"use strict";
/***************************************************************************************************************************
 * @license                                                                                                                *
 * Copyright 2017 Coinbase, Inc.                                                                                           *
 *                                                                                                                         *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance          *
 * with the License. You may obtain a copy of the License at                                                               *
 *                                                                                                                         *
 * http://www.apache.org/licenses/LICENSE-2.0                                                                              *
 *                                                                                                                         *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on     *
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the                      *
 * License for the specific language governing permissions and limitations under the License.                              *
 ***************************************************************************************************************************/
exports.__esModule = true;
var GTT = require("gdax-trading-toolkit");
var GDAXExchangeAPI_1 = require("gdax-trading-toolkit/build/src/exchanges/gdax/GDAXExchangeAPI");
var logger = GTT.utils.ConsoleLoggerFactory();
//const pusher = new GTT.utils.PushBullet(process.env.PUSHBULLET_KEY);
//const deviceID = process.env.PUSHBULLET_DEVICE_ID;
var product = 'BTC-USD';
/**
 * Remember to set GDAX_KEY, GDAX_SECRET and GDAX_PASSPHRASE envars to allow trading
 */
var config = {
    logger: logger,
    auth: { key: process.env.GDAX_KEY, secret: process.env.GDAX_SECRET, passphrase: process.env.GDAX_PASSPHRASE },
    apiUrl: GDAXExchangeAPI_1.GDAX_API_URL
};
var gdaxAPI = new GDAXExchangeAPI_1.GDAXExchangeAPI(config);
var _a = product.split('-'), base = _a[0], quote = _a[1];
gdaxAPI.loadBalances();
//submitTrade('buy', '0.01');
function submitTrade(side, amount) {
    var order = {
        type: 'placeOrder',
        time: new Date(),
        productId: product,
        orderType: 'market',
        side: side,
        size: amount
    };
    gdaxAPI.placeOrder(order).then(function (result) {
        console.log(result);
        console.log('Order executed', "Order to " + order.side + " 0.1 " + base + " placed. Result: " + result.status);
        //pushMessage('Order executed', `Order to ${order.side} 0.1 ${base} placed. Result: ${result.status}`);
    });
}
