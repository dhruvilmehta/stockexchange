import { createClient, RedisClientType } from 'redis';
import { DbMessage, DbMessageType } from './types/DbMessage';
import dotenv from 'dotenv'
// import prisma from "@repo/prisma-client/client"
import prisma from './prisma';

dotenv.config()

async function main() {
    const url = process.env.REDIS_CLIENT || 'redis://localhost:6379'
    const redisClient: RedisClientType = createClient({ url: url })
    await redisClient.connect();
    console.log("connected to redis on host ", url);

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
                        try {
                            await prisma.prices.create({
                                data: {
                                    companyName: "tata",
                                    time: timestamp,
                                    price: Number(price),
                                    volume: Number(data.data.quantity)
                                }
                            })
                        } catch (error) {
                            console.log(error)
                        }
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