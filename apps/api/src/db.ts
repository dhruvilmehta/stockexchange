import { createClient, RedisClientType } from "redis";
import { DbMessage, DbMessageType } from "./types/DbMessage";
import prisma from "./prisma";

export async function main() {
    //console.log("Db running")
    const url = process.env.REDIS_CLIENT || 'redis://localhost:6379'
    const redisClient: RedisClientType = createClient({ url: url })
    await redisClient.connect();
    // console.log("connected to redis on host ", url);

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (response) {
            const data: DbMessage = JSON.parse(response);
            if (data.type === DbMessageType.TRADE_ADDED) {
                // console.log("adding data to DB");
                // console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);

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
                            // console.log("Error creating db record")
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
