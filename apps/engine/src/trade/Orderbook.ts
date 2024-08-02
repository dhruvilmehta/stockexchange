import { PriorityQueue } from "@datastructures-js/priority-queue";
import { BASE_CURRENCY } from "./Engine";
import { Order } from "../types/Order";
import { SnapShotType } from "../types/SnapShot";
import { Fill } from "../types/Fill";
import { ExecutedOrder } from "../types/ExecutedOrder";
import { Depth } from "../types/Depth";

export enum OrderSide {
    BUY = "buy",
    SELL = "sell",
}

export class Orderbook {
    bids: PriorityQueue<Order>;
    asks: PriorityQueue<Order>;
    baseAsset: string;
    quoteAsset: string = BASE_CURRENCY;
    lastTradeId: number;
    currentPrice: number;

    constructor(
        baseAsset: string,
        bids: Order[],
        asks: Order[],
        lastTradeId: number,
        currentPrice: number,
    ) {
        this.bids = new PriorityQueue<Order>((a: Order, b: Order) => b.price - a.price);
        bids.forEach(order => this.bids.push(order));
        this.asks = new PriorityQueue<Order>((a: Order, b: Order) => a.price - b.price);
        asks.forEach(order => this.asks.push(order));
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId;
        this.currentPrice = currentPrice;
    }

    getTicker(): string {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }

    getSnapshot(): SnapShotType {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids.toArray(),
            asks: this.asks.toArray(),
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice,
        };
    }

    addOrder(order: Order): ExecutedOrder {
        if ((order.side === OrderSide.BUY)) {
            const { executedQty, fills } = this.matchBidToAsk(order);
            order.filled = executedQty;
            if (executedQty !== order.quantity) this.bids.push(order); // incomplete fills, still some quantity remaining
            return {
                executedQty,
                fills,
            };
        } else {
            const { executedQty, fills } = this.matchAskToBid(order);
            order.filled = executedQty;
            if (executedQty != order.quantity) this.asks.push(order); // incomplete fills, still some quantity remaining
            return {
                executedQty,
                fills
            }
        }
    }

    matchBidToAsk(order: Order): ExecutedOrder {
        const fills: Fill[] = [];
        let executedQty: number = 0;
        const size = this.asks.size();
        for (let i = 0; i < size && !this.asks.isEmpty(); i++) {
            if (executedQty === order.quantity) break;
            let currAsk: Order = this.asks.front();

            if (currAsk.price <= order.price) {
                currAsk = this.asks.dequeue();
                const filledQty: number = Math.min(currAsk.quantity - currAsk.filled, order.quantity - executedQty);
                executedQty += filledQty;
                currAsk.filled += filledQty;
                if (currAsk.quantity !== currAsk.filled) this.asks.push(currAsk);
                fills.push({
                    price: currAsk.price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: currAsk.userId,
                    markerOrderId: currAsk.orderId
                })
            } else break;
        }
        return {
            executedQty,
            fills
        }
    }

    matchAskToBid(order: Order): ExecutedOrder {
        const fills: Fill[] = [];
        let executedQty: number = 0;
        const size = this.bids.size();
        for (let i = 0; i < size && !this.bids.isEmpty(); i++) {
            if (executedQty === order.quantity) break;
            let currBid: Order = this.bids.front();

            if (currBid.price >= order.price) {
                currBid = this.bids.dequeue();
                const filledQty: number = Math.min(currBid.quantity - currBid.filled, order.quantity - executedQty);
                executedQty += filledQty;
                currBid.filled += filledQty;
                if (currBid.quantity != currBid.filled) this.bids.push(currBid);
                fills.push({
                    price: currBid.price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: currBid.userId,
                    markerOrderId: currBid.orderId
                })
            } else break;
        }
        return {
            executedQty,
            fills
        }
    }

    getDepth(): Depth {
        const bids: [string, string][] = [];
        const asks: [string, string][] = [];

        const bidsObj = new Map<number, number>();
        const asksObj = new Map<number, number>();

        this.bids.toArray().forEach(bid => {
            if (!bidsObj.has(bid.price)) bidsObj.set(bid.price, 0);
            bidsObj.set(bid.price, bidsObj.get(bid.price)! + bid.quantity - bid.filled);
        })

        this.asks.toArray().forEach(ask => {
            if (!asksObj.has(ask.price)) asksObj.set(ask.price, 0);
            asksObj.set(ask.price, asksObj.get(ask.price)! + ask.quantity - ask.filled);
        })

        for (const [price, quantity] of bidsObj)
            bids.push([price.toString(), quantity.toString()]);

        for (const [price, quantity] of asksObj)
            asks.push([price.toString(), quantity.toString()]);

        return {
            bids,
            asks
        }
    }

    cancelBid(order: Order): number {
        const deletedOrder: Order[] = this.bids.remove(x => x.orderId === order.orderId);
        if (deletedOrder.length != 0) return deletedOrder[0]!.price

        return 0;
    }

    cancelAsk(order: Order): number {
        const deletedOrder: Order[] = this.asks.remove(x => x.orderId === order.orderId);
        if (deletedOrder.length != 0) return deletedOrder[0]!.price

        return 0;
    }

    getOpenOrders(userId: string): Order[] {
        const asks = this.asks.toArray().filter(x => x.userId === userId);
        const bids = this.bids.toArray().filter(x => x.userId === userId);

        return [...asks, ...bids];
    }
}