import { createClient, RedisClientType } from "redis";
import { Engine } from "./trade/Engine";
import dotenv from "dotenv"

dotenv.config()

async function main() {
    const engine: Engine = new Engine()
    const url = process.env.REDIS_CLIENT || 'redis://localhost:6379'
    const redisClient: RedisClientType = createClient({ url: url })
    await redisClient.connect()
    console.log("redis connected on host ", url)

    while (true) {
        const response = await redisClient.rPop("messages")

        if (response) {
            console.log(response, " Received from api")
            engine.process(JSON.parse(response))
        }
    }
}

main()