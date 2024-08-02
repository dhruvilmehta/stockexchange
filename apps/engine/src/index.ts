import { createClient, RedisClientType } from "redis";
import { Engine } from "./trade/Engine";

async function main() {
    const engine: Engine = new Engine()
    const redisClient: RedisClientType = createClient()
    await redisClient.connect()
    console.log("redis connected")

    while (true) {
        const response = await redisClient.rPop("messages")

        if (response) {
            console.log(response, " Received from api")
            engine.process(JSON.parse(response))
        }
    }
}

main()