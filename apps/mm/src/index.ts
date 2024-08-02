import axios from "axios";

const BASE_URL = "http://localhost:3001";
const TOTAL_BIDS = 15;
const TOTAL_ASK = 15;
const MARKET = "TATA_INR";
const USER_ID = "1";

async function main() {
    const price = 1000 + Math.random() * 10;
    console.log("Here")
    const openOrders = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`, {
        headers: {
            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
        }
    });
    console.log("Got open orders")
    console.log(openOrders)
    const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
    const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

    const cancelledBids = await cancelBidsMoreThan(openOrders.data, price);
    const cancelledAsks = await cancelAsksLessThan(openOrders.data, price);


    let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
    let asksToAdd = TOTAL_ASK - totalAsks - cancelledAsks;

    while (bidsToAdd > 0 || asksToAdd > 0) {
        if (bidsToAdd > 0) {
            console.log("Sending post request")
            await axios.post(`${BASE_URL}/api/v1/order`, {
                market: MARKET,
                price: (price + Math.random() * 1).toFixed(1).toString(),
                quantity: "1",
                side: "buy",
                userId: USER_ID
            }, {
                headers: {
                    Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
                }
            });
            bidsToAdd--;
        }
        if (asksToAdd > 0) {
            console.log("Sending post request 2")
            await axios.post(`${BASE_URL}/api/v1/order`, {
                market: MARKET,
                price: (price - Math.random() * 1).toFixed(1).toString(),
                quantity: "1",
                side: "sell",
                userId: USER_ID
            }, {
                headers: {
                    Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTcyMjM4MDI1Nn0.sfo1n134ggCXt-m7aQ-6ZFc6PjWNOX0z9AB_773w4as"
                }
            });
            asksToAdd--;
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function cancelBidsMoreThan(openOrders: any[], price: number) {
    console.log("Sending delete request");
    let delay = 500; // delay in milliseconds (adjust as needed)

    for (let o of openOrders) {
        if (o.side === "buy" && (o.price > price || Math.random() < 0.1)) {
            // Await setTimeout to introduce delay between requests
            await new Promise(resolve => setTimeout(resolve, delay));

            // Send the delete request
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

    return openOrders.filter(o => o.side === "buy" && (o.price > price || Math.random() < 0.1)).length;
}

async function cancelAsksLessThan(openOrders: any[], price: number) {
    console.log("Sending delete request 2");
    let delay = 500; // delay in milliseconds (adjust as needed)

    for (let o of openOrders) {
        if (o.side === "sell" && (o.price < price || Math.random() < 0.5)) {
            // Await setTimeout to introduce delay between requests
            await new Promise(resolve => setTimeout(resolve, delay));

            // Send the delete request
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

    return openOrders.filter(o => o.side === "sell" && (o.price < price || Math.random() < 0.5)).length;
}

setInterval(() => {
    main()
}, 3000)