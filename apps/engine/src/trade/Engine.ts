import { SnapShotType } from "../types/SnapShot";
import { UserBalance } from "../types/UserBalance";
import { Orderbook } from "./Orderbook";
import fs from 'fs';
import { MessageToOrderbook, MessageToOrderbookTypes } from "../types/toOrderbook";
import { RedisManager } from "../RedisManager";
import { OrderSide } from "./Orderbook";
import { Order } from "../types/Order";
import { CustomError } from "../types/customError";
import { Fill } from "../types/Fill";
import { Depth } from "../types/Depth";
import { MessageFromOrderbookTypes } from "../types/fromOrderbook";
import { DbMessageType } from "../types/DbMessage";
import prisma from "@repo/prisma-client/client"

export const BASE_CURRENCY = "INR";

const sampleOrderbooks = [
    {
        "baseAsset": "TATA",
        "bids": [],
        "asks": [],
        "lastTradeId": 33,
        "currentPrice": 1000
    }
]

export class Engine {
    private orderbooks: Map<string, Orderbook>;
    private balances: Map<string, UserBalance> = new Map();

    constructor() {
        let snapshot = null;
        this.orderbooks = new Map<string, Orderbook>();
        try {
            if (process.env.WITH_SNAPSHOT) snapshot = fs.readFileSync("./snapshot.json");
        } catch (e) {
            console.log("No snapshot found");
        }

        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            snapshotSnapshot.orderbooks.map((orderbook: any) => {
                this.orderbooks.set(`${orderbook.baseAsset}_${BASE_CURRENCY}`.toLowerCase(), new Orderbook(orderbook.baseAsset, orderbook.bids, orderbook.asks, orderbook.currentPrice, orderbook.lastTradeId));
            })
            this.balances = new Map(snapshotSnapshot.balances);
        } else {
            sampleOrderbooks.map((orderbook) => {
                this.orderbooks.set(`${orderbook.baseAsset}_${BASE_CURRENCY}`.toLowerCase(), new Orderbook(orderbook.baseAsset, orderbook.bids, orderbook.asks, orderbook.currentPrice, orderbook.lastTradeId));
            })
            this.setBaseBalances();
        }
        setInterval(() => {
            this.saveSnapshot();
        }, 1000 * 3);

        console.log(this.orderbooks, " Order books")
    }

    saveSnapshot() {
        let currOrderbook: SnapShotType[] = [];
        for (const value of this.orderbooks.values()) currOrderbook.push(value.getSnapshot())
        const snapshotSnapshot = {
            orderbooks: currOrderbook,
            balances: Array.from(this.balances.entries()),
        };
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }

    setBaseBalances() {
        console.log("Setting base balances")
        this.balances.set("1", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0,
            },
            TATA: {
                available: 10000000,
                locked: 0,
            },
        });

        this.balances.set("2", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0,
            },
            TATA: {
                available: 10000000,
                locked: 0,
            },
        });

        this.balances.set("5", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0,
            },
            TATA: {
                available: 10000000,
                locked: 0,
            },
        });
    }

    process({
        message,
        clientId,
    }: {
        message: MessageToOrderbook;
        clientId: string;
    }) {
        console.log(message, " Engine process")
        switch (message.type) {
            case MessageToOrderbookTypes.CREATE_ORDER: {
                console.log(message.data.userId, "User id", this.balances.get(message.data.userId))
                const { executedQty, fills, orderId } = this.createOrder(
                    message.data.market.toLowerCase(),
                    message.data.price,
                    message.data.quantity,
                    message.data.side,
                    message.data.userId,
                );

                RedisManager.getInstance().sendToApi(clientId, {
                    type: MessageFromOrderbookTypes.ORDER_PLACED,
                    payload: {
                        orderId,
                        executedQty,
                        fills,
                    },
                });
                break;
            }
            case MessageToOrderbookTypes.CANCEL_ORDER:
                try {
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market.toLowerCase();
                    const cancelOrderbook: Orderbook | undefined = this.orderbooks.get(cancelMarket);
                    if (!cancelOrderbook) throw new CustomError("Orderbook not found", 404)

                    const quoteAsset = cancelMarket.split("_")[1]?.toUpperCase();
                    console.log(quoteAsset, " Quote Asset")
                    if (!quoteAsset) throw new CustomError("Null quote asset", 404)
                    const order = cancelOrderbook.asks.toArray().find(o => o.orderId === orderId) || cancelOrderbook.bids.toArray().find(o => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new CustomError("No order found", 404);
                    }

                    if (order.side === OrderSide.BUY) {
                        const price = cancelOrderbook.cancelBid(order)
                        const leftQuantity = (order.quantity - order.filled) * order.price;

                        const balance: UserBalance | undefined = this.balances.get(order.userId)
                        if (!balance) throw new CustomError("User balance not found", 404)

                        if (!balance[BASE_CURRENCY]) throw new CustomError("Error fetching base currency", 404)

                        balance[BASE_CURRENCY].available += leftQuantity;
                        balance[BASE_CURRENCY].locked -= leftQuantity;

                        if (price) this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                    } else {
                        const price = cancelOrderbook.cancelAsk(order)
                        const leftQuantity = order.quantity - order.filled;

                        const balance: UserBalance | undefined = this.balances.get(order.userId)
                        if (!balance) throw new CustomError("User balance not found", 404)
                        if (!balance[quoteAsset]) throw new CustomError("Error fetching quote asset", 404)

                        balance[quoteAsset].available += leftQuantity;
                        balance[quoteAsset].locked -= leftQuantity;

                        if (price) this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                    }

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: MessageFromOrderbookTypes.ORDER_CANCELLED,
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });

                } catch (e) {
                    console.log("Error hwile cancelling order",);
                    console.log(e);
                }
                break;
            case MessageToOrderbookTypes.GET_OPEN_ORDERS:
                console.log("GET_OPEN_ORDERS")
                try {
                    const openOrderbook: Orderbook | undefined = this.orderbooks.get(message.data.market.toLowerCase());
                    if (!openOrderbook) throw new CustomError("Orderbook not found", 404)

                    const openOrders: Order[] = openOrderbook.getOpenOrders(message.data.userId);

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: MessageFromOrderbookTypes.OPEN_ORDERS,
                        payload: openOrders
                    });
                } catch (e) {
                    console.log(e);
                }
                break;
            case MessageToOrderbookTypes.ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;

            case MessageToOrderbookTypes.GET_DEPTH:
                try {
                    const market = message.data.market.toLowerCase();
                    const orderbook = this.orderbooks.get(market);
                    if (!orderbook) throw new CustomError("No orderbook found", 404);

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: MessageFromOrderbookTypes.DEPTH,
                        payload: orderbook.getDepth()
                    });
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: MessageFromOrderbookTypes.DEPTH,
                        payload: {
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
            case MessageToOrderbookTypes.GET_USER_BALANCE: {
                console.log("GET_USER_BALANCE")
                try {
                    const asset = message.data.asset.toUpperCase()
                    const userId = message.data.userId
                    const balance: UserBalance | undefined = this.balances.get(userId)
                    if (!balance) throw new CustomError("UserBalance not found", 404)
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: MessageFromOrderbookTypes.USER_BALANCE,
                        payload: {
                            asset: asset,
                            balance: (balance[asset]?.available || "0") as string
                        }
                    })
                } catch (error) {

                }
            }
        }
    }

    onRamp(userId: string, amount: number) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            });
        }
        else userBalance[BASE_CURRENCY]!.available += amount;
    }

    sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderbooks.get(market);
        if (!orderbook) throw new CustomError("Orderbook not found", 404);

        const depth = orderbook.getDepth();
        const updatedBids = depth.bids.filter(x => x[0] === price);
        const updatedAsks = depth.asks.filter(x => x[0] === price);

        RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

    createOrder(
        market: string,
        price: string,
        quantity: string,
        side: OrderSide,
        userId: string,
    ) {
        const orderbook: Orderbook | undefined = this.orderbooks.get(market.toLowerCase())
        if (!orderbook) throw new CustomError("Orderbook not found", 404)

        const baseAsset: string = market.split("_")[0]!.toUpperCase();
        const quoteAsset: string = market.split("_")[1]!.toUpperCase();

        this.checkAndLockFunds(
            baseAsset,
            quoteAsset,
            side,
            userId,
            price,
            quantity,
        );

        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId:
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId,
        };

        const { fills, executedQty } = orderbook.addOrder(order);

        this.updateBalance(userId, baseAsset, quoteAsset, side, fills);
        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);

        this.publishWsDepthUpdates(fills, price, side, market, orderbook);
        this.publishWsTrades(fills, userId, market);
        return { executedQty, fills, orderId: order.orderId };
    }

    publishWsTrades(fills: Fill[], userId: string, market: string): void {
        console.log("Publishing trades")
        fills.forEach(fill => {
            RedisManager.getInstance().publishMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId, // TODO: Is this right?
                    p: fill.price,
                    q: fill.qty.toString(),
                    s: market,
                }
            });
        });
    }

    publishWsDepthUpdates(fills: Fill[], price: string, side: OrderSide, market: string, orderbook: Orderbook): void {
        const depth: Depth = orderbook.getDepth();

        if (side === OrderSide.BUY) {
            const fillPrices = fills.map(fill => fill.price);
            const updatedAsks = depth.asks.filter(ask => fillPrices.includes(ask[0]));

            // Add missing prices from fills to updatedAsks
            fills.forEach(fill => {
                if (!depth.asks.some(ask => ask[0] === fill.price)) {
                    updatedAsks.push([fill.price, '0']);
                }
            });

            const updatedBid = depth.bids.find(x => x[0] === price);

            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks.length ? updatedAsks : [[price, String(0)]],
                    b: updatedBid ? [updatedBid] : [[price, String(0)]],
                    e: "depth"
                }
            })
        } else {
            const fillPrices = fills.map(fill => fill.price);
            const updatedBids = depth.bids.filter(bid => fillPrices.includes(bid[0]));

            // Add missing prices from fills to updatedAsks
            fills.forEach(fill => {
                if (!depth.bids.some(bid => bid[0] === fill.price)) {
                    updatedBids.push([fill.price, '0']);
                }
            });
            const updatedAsk = depth.asks.find(x => x[0] === price);
            console.log("--------------------")
            console.log(updatedBids, updatedAsk)
            console.log("--------------------")
            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `p${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [[price, String(0)]],
                    b: updatedBids.length ? updatedBids : [[price, String(0)]],
                    e: "depth"
                }
            });
        }
    }

    updateDbOrders(
        order: Order,
        executedQty: number,
        fills: Fill[],
        market: string,
    ) {
        RedisManager.getInstance().pushMessage({
            type: DbMessageType.ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            },
        });

        fills.forEach((fill) => {
            RedisManager.getInstance().pushMessage({
                type: DbMessageType.ORDER_UPDATE,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty,
                },
            });
        });
    }

    createDbTrades(fills: Fill[], market: string, userId: string): void {
        fills.forEach((fill) => {
            RedisManager.getInstance().pushMessage({
                type: DbMessageType.TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId, // TODO: Is this right?
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now(),
                },
            });
        });
    }

    updateBalance(
        userId: string,
        baseAsset: string,
        quoteAsset: string,
        side: OrderSide,
        fills: Fill[],
    ): void {
        if (side === OrderSide.BUY) {
            fills.forEach((fill) => {
                // Update quote asset balance
                (this.balances.get(fill.otherUserId) as UserBalance)[quoteAsset]!.available += fill.qty * Number(fill.price);
                (this.balances.get(userId) as UserBalance)[quoteAsset]!.locked -= fill.qty * Number(fill.price);

                // Update base asset balance
                (this.balances.get(fill.otherUserId) as UserBalance)[baseAsset]!.locked -= fill.qty;
                (this.balances.get(userId) as UserBalance)[baseAsset]!.available += fill.qty;
            });
        } else {
            fills.forEach((fill) => {
                // Update quote asset balance
                (this.balances.get(fill.otherUserId) as UserBalance)[quoteAsset]!.locked -= fill.qty * Number(fill.price);
                (this.balances.get(userId) as UserBalance)[quoteAsset]!.available += fill.qty * Number(fill.price);

                // Update base asset balance
                (this.balances.get(fill.otherUserId) as UserBalance)[baseAsset]!.available += fill.qty;
                (this.balances.get(userId) as UserBalance)[baseAsset]!.locked -= fill.qty;
            });
        }
    }

    checkAndLockFunds(
        baseAsset: string,
        quoteAsset: string,
        side: OrderSide,
        userId: string,
        price: string,
        quantity: string,
    ): void {
        console.log("-----------------")
        console.log(this.balances.get(userId), " Check Funds")
        console.log("-----------------")
        try {
            if (side === OrderSide.BUY) {
                if ((this.balances.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price)) {
                    throw new CustomError("Insufficient funds", 400);
                }
                if (!this.balances.get(userId)) throw new CustomError("Balance not found", 404);
                (this.balances.get(userId) as UserBalance)[quoteAsset]!.available -= Number(quantity) * Number(price);
                (this.balances.get(userId) as UserBalance)[quoteAsset]!.locked += Number(quantity) * Number(price);
            } else {
                if ((this.balances.get(userId)?.[baseAsset]?.available || 0) < Number(quantity) * Number(price)) {
                    throw new CustomError("Insufficient funds", 400);
                }

                if (!this.balances.get(userId)) throw new Error("User not found");
                (this.balances.get(userId) as UserBalance)[baseAsset]!.available -= Number(quantity) * Number(price);
                (this.balances.get(userId) as UserBalance)[baseAsset]!.locked += Number(quantity) * Number(price);
            }
        } catch (error) {
            console.error((error as CustomError).message)
        }
    }
}