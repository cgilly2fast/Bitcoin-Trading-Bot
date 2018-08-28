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

import * as GTT from "gdax-trading-toolkit";
import { Big } from "gdax-trading-toolkit/build/src/lib/types";
import { GDAX_WS_FEED, GDAXFeed, GDAXFeedConfig } from "gdax-trading-toolkit/build/src/exchanges";
import { GDAX_API_URL,  GDAXExchangeAPI } from "gdax-trading-toolkit/build/src/exchanges/gdax/GDAXExchangeAPI";
import { PlaceOrderMessage, TickerMessage } from "gdax-trading-toolkit/build/src/core";
import { GDAXConfig } from "gdax-trading-toolkit/build/src/exchanges/gdax/GDAXInterfaces";
import { LiveOrder } from "gdax-trading-toolkit/build/src/lib";
import { APIError, extractResponse, GTTError, HTTPError } from 'gdax-trading-toolkit/build/src/lib/errors';

const logger = GTT.utils.ConsoleLoggerFactory();
//const pusher = new GTT.utils.PushBullet(process.env.PUSHBULLET_KEY);
//const deviceID = process.env.PUSHBULLET_DEVICE_ID;
const product = 'BTC-USD';
/**
 * Remember to set GDAX_KEY, GDAX_SECRET and GDAX_PASSPHRASE envars to allow trading
 */

 const config: GDAXConfig = {
    logger: logger,
    auth: { key: process.env.GDAX_KEY, secret: process.env.GDAX_SECRET, passphrase: process.env.GDAX_PASSPHRASE },
    apiUrl: GDAX_API_URL
};

const gdaxAPI = new GDAXExchangeAPI(config);
const [base, quote] = product.split('-');


gdaxAPI.loadBalances();
//submitTrade('buy', '0.01');

function submitTrade(side: string, amount: string) {
    const order: PlaceOrderMessage = {
        type: 'placeOrder',
        time: new Date(),
        productId: product,
        orderType: 'market',
        side: side,
        size: amount
    };
    gdaxAPI.placeOrder(order).then((result: LiveOrder) => {
        console.log(result);
        console.log('Order executed', `Order to ${order.side} 0.1 ${base} placed. Result: ${result.status}`)
        //pushMessage('Order executed', `Order to ${order.side} 0.1 ${base} placed. Result: ${result.status}`);
    });
}
