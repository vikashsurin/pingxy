import { eventBus } from "@lib/events";
import redis from "@lib/redis";

// Use Bun.env for better performance in the Bun runtime
const SERVER_ID = Bun.env.HOSTNAME || Bun.env.SERVER_ID || "local-dev";
const GLOBAL_CHAN = "pingxy:events";

export const initGlobalBus = async () => {
    // Subscriptions MUST use a duplicate connection
    const sub = await redis.duplicate();

    sub.subscribe(GLOBAL_CHAN, (message) => {
        const { event, payload, sourceId } = JSON.parse(message);

        // CRITICAL: Compare against the SERVER_ID variable we defined above
        if (sourceId !== SERVER_ID) {
            console.log(`[GlobalBus] Syncing ${event} from remote node: ${sourceId}`);
            eventBus.emit(event, payload);
        }
    });
};

export const broadcast = (event: string, payload: any) => {
    // 1. Emit locally for immediate response to sockets on THIS container
    eventBus.emit(event, payload);

    // 2. Publish to Redis so all OTHER containers can sync
    redis.publish(GLOBAL_CHAN, JSON.stringify({
        event,
        payload,
        sourceId: SERVER_ID
    }));
};