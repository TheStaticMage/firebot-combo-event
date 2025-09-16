import { EventSource } from '@crowbartools/firebot-custom-scripts-types/types/modules/event-manager';
import { firebot } from "./main";

const eventSource: EventSource = {
    id: "combo-event",
    name: "Combo Event",
    events: [
        {
            id: "bits-combo",
            name: "Combo",
            description: "When someone uses bits on a Combo in your channel.",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                isAnonymous: false,
                bits: 5
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData: Record<string, any>) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** cheered **${eventData.bits}** bits in a combo.`;
                }
            }
        }
    ]
};

export function triggerBitsCombo(
    username: string,
    userId: string,
    userDisplayName: string,
    bits: number
): void {
    const { eventManager } = firebot.modules;
    eventManager.triggerEvent("combo-event", "bits-combo", {
        username,
        userId,
        userDisplayName,
        isAnonymous: false,
        bits
    });
}

export function registerEventSource() {
    // Register the event source
    const { eventManager } = firebot.modules;
    eventManager.registerEventSource(eventSource);

    // Register our event with the bits filter
    const { eventFilterManager } = firebot.modules;
    eventFilterManager.addEventToFilter("firebot:cheerbitsamount", "combo-event", "bits-combo");

    // Register our event with the bits variable
    const { replaceVariableManager } = firebot.modules;
    replaceVariableManager.addEventToVariable("cheerBitsAmount", "combo-event", "bits-combo");
}
