import { EventSubSubscription } from "@twurple/eventsub-base";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { triggerBitsCombo } from "./event";
import { firebot, logger } from "./main";

class TwitchEventSubClient {
    private _eventSubListener: EventSubWsListener | undefined;
    private _subscriptions: EventSubSubscription[] = [];

    constructor() {
        this._eventSubListener = undefined;
    }

    private createSubscriptions(listener: EventSubWsListener): void {
        const streamer = firebot.firebot.accounts.streamer;

        const bitsSubscription = listener.onChannelBitsUse(
            streamer.userId,
            async (event: any) => {
                switch (event.type) {
                    case "combo":
                        triggerBitsCombo(
                            event.userName,
                            event.userId,
                            event.userDisplayName,
                            event.bits
                        );
                        break;
                    default:
                        // Ignore other types because they're already supported in Firebot
                        break;
                }
            }
        );
        this._subscriptions.push(bitsSubscription);

        // Streamer using bits on their own channel does NOT trigger the `channel.bits.use` eventsub event. To test
        // this event, you can uncomment this code so that any channel point redemption triggers the event, since
        // you can redeem those for free on your own channel. Just remember to comment it out again when you're done!
        // ---
        // const customRewardRedemptionSubscription = listener.onChannelRedemptionAdd(streamer.userId, async (event: any) => {
        //     logger.info(`Custom Reward Redemption [testing combo event]: ${event.rewardTitle} by ${event.userDisplayName} (${event.userName})`);
        //     triggerBitsCombo(
        //         event.userName,
        //         event.userId,
        //         event.userDisplayName,
        //         5
        //     );
        // });
        // this._subscriptions.push(customRewardRedemptionSubscription);
    }

    async createClient(): Promise<void> {
        this.disconnectEventSub();
        logger.info("Connecting to Twitch EventSub...");

        try {
            const { twitchApi } = firebot.modules;
            this._eventSubListener = new EventSubWsListener({
                apiClient: twitchApi.getClient()
            });

            this._eventSubListener.start();
            this.createSubscriptions(this._eventSubListener);
            logger.info("Connected to the Twitch EventSub!");
        } catch (error) {
            logger.error(`Failed to connect to Twitch EventSub: ${error}`);
            return;
        }
    }

    removeSubscriptions(): void {
        for (const sub of this._subscriptions) {
            try {
                sub.stop();
            } catch {
                // Silently fail, because we don't care
            }
        }
        this._subscriptions = [];
    }

    disconnectEventSub(): void {
        this.removeSubscriptions();
        try {
            if (this._eventSubListener) {
                this._eventSubListener.stop();
                logger.info("Disconnected from EventSub.");
            }
        } catch (error) {
            logger.debug(`Error disconnecting EventSub: ${error}`);
        }
    }
}

export const twitchEventSubClient = new TwitchEventSubClient();
