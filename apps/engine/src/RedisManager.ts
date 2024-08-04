import { createClient, RedisClientType } from "redis";
import { DbMessage } from "./types/DbMessage";
import { MessageFromOrderbook } from "./types/fromOrderbook";
import { WsMessage } from "./types/WsMessage";

export class RedisManager {
    private client: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        const url = process.env.REDIS_CLIENT || 'redis://localhost:6379'
        this.client = createClient({ url: url });
        this.client.connect();
        console.log("Redis connected on host ", url)
    }

    public static getInstance() {
        if (this.instance) return this.instance;
        this.instance = new RedisManager();
        return this.instance;
    }

    public pushMessage(message: DbMessage) {
        this.client.lPush("db_processor", JSON.stringify(message));
    }

    public publishMessage(channel: string, message: WsMessage) {
        this.client.publish(channel, JSON.stringify(message));
    }

    public sendToApi(clientId: string, message: MessageFromOrderbook) {
        this.client.publish(clientId, JSON.stringify(message));
    }
}
