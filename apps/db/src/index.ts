import { createClient } from 'redis';
import { DbMessage, DbMessageType } from './types/DbMessage';
import dotenv from 'dotenv'
import prisma from "@repo/prisma-client/client"

dotenv.config()

async function main() {
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (response) {
            const data: DbMessage = JSON.parse(response);
            if (data.type === DbMessageType.TRADE_ADDED) {
                console.log("adding data to DB");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                // const query = 'INSERT INTO tata_prices (time, price) VALUES ($1, $2)';
                // // TODO: How to add volume?
                // const values = [timestamp, price];
                // await pgClient.query(query, values);
                switch (data.data.market.toLowerCase()) {
                    case "tata_inr": {
                        await prisma.prices.create({
                            data: {
                                companyName: "tata",
                                time: timestamp,
                                price: price
                            }
                        })
                        break;
                    }
                    default:
                        throw new Error(`No data available for company: ${data.data.market}`);
                }
            }
        }
    }

}

main();