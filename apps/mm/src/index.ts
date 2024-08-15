import axios from "axios";
import express from 'express'

const BASE_URL = "http://localhost:3001";
// const BASE_URL = 'https://stockexchange-4p5n.onrender.com';
const TOTAL_BIDS = 15;
const TOTAL_ASK = 15;
const MARKET = "TATA_INR";
const USER_ID = "1";

const app = express()

app.get("/", (req, res) => {
    return res.status(200).send("mm Working")
})

async function main() {
    const price = 1000 + Math.random() * 10;
    console.log("Starting trading cycle with price:", price);

    // Fetch open orders
    const openOrders = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`, {
        headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
        }
    });
    console.log("Fetched open orders:", openOrders.data);

    const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
    const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

    const cancelledBids = await cancelBidsMoreThan(openOrders.data, price);
    const cancelledAsks = await cancelAsksLessThan(openOrders.data, price);

    let bidsToAdd = Math.max(TOTAL_BIDS - totalBids - cancelledBids, 0);
    let asksToAdd = Math.max(TOTAL_ASK - totalAsks - cancelledAsks, 0);

    while (bidsToAdd > 0 || asksToAdd > 0) {
        if (bidsToAdd > 0) {
            await addOrder("buy", price);
            bidsToAdd--;
        }
        if (asksToAdd > 0) {
            await addOrder("sell", price);
            asksToAdd--;
        }
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Random delay between 1s and 3s
}

async function addOrder(side: "buy" | "sell", basePrice: number) {
    const price = (basePrice + (side === "buy" ? Math.random() * 1 : -Math.random() * 1)).toFixed(1).toString();
    const quantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10

    console.log(`Adding ${side} order with price: ${price}, quantity: ${quantity}`);
    await axios.post(`${BASE_URL}/api/v1/order`, {
        market: MARKET,
        price,
        quantity: quantity.toString(),
        side,
        userId: USER_ID
    }, {
        headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
        }
    });
}

async function cancelBidsMoreThan(openOrders: any[], price: number) {
    console.log("Cancelling bids more than price:", price);
    let delay = Math.random() * 500 + 500; // Random delay between 500ms and 1000ms

    for (let o of openOrders) {
        if (o.side === "buy" && (o.price > price || Math.random() < 0.2)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            await axios.delete(`${BASE_URL}/api/v1/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                },
                headers: {
                    Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
                }
            });
        }
    }

    return openOrders.filter(o => o.side === "buy" && (o.price > price || Math.random() < 0.2)).length;
}

async function cancelAsksLessThan(openOrders: any[], price: number) {
    console.log("Cancelling asks less than price:", price);
    let delay = Math.random() * 500 + 500; // Random delay between 500ms and 1000ms

    for (let o of openOrders) {
        if (o.side === "sell" && (o.price < price || Math.random() < 0.3)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            await axios.delete(`${BASE_URL}/api/v1/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                },
                headers: {
                    Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
                }
            });
        }
    }

    return openOrders.filter(o => o.side === "sell" && (o.price < price || Math.random() < 0.3)).length;
}

app.listen(3004, () => {
    console.log("Listening on port 3004")
})

setInterval(() => {
    main();
}, Math.random() * 10000 + 5000); // Random interval between 5s and 15s
