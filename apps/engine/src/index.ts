import { createClient, RedisClientType } from "redis";
import { Engine } from "./trade/Engine";
import dotenv from "dotenv"
import express from 'express';

dotenv.config()

const app = express()

app.get("/", (req, res) => {
    return res.status(200).send("Engine Working")
})

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

app.listen(3000, () => {
    console.log("Listening on port 3000")
})
main()