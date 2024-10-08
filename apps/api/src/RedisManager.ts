
import { RedisClientType, createClient } from "redis";
import { MessageFromOrderbook } from "./types/fromOrderbook";
import { MessageToOrderbook } from "./types/toOrderbook";

export class RedisManager {
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        const url = process.env.REDIS_CLIENT || 'redis://localhost:6379'
        this.client = createClient({ url: url });
        this.client.connect();
        this.publisher = createClient({ url: url });
        this.publisher.connect();
        console.log("Redis connected on host ", url)
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public sendAndAwait(message: MessageToOrderbook) {
        return new Promise<MessageFromOrderbook>((resolve) => {
            const id = this.getRandomClientId();
            this.client.subscribe(id, (message: any) => {
                this.client.unsubscribe(id);
                resolve(JSON.parse(message));
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }

    public getRandomClientId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

}