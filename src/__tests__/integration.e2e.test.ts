import { twitchEventSubClient } from "../eventsub";

// Mock the complete flow: EventSub -> triggerBitsCombo -> eventManager
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockOnChannelBitsUse = jest.fn();
const mockSubscriptionStop = jest.fn();

jest.mock("@twurple/eventsub-ws", () => ({
    EventSubWsListener: jest.fn().mockImplementation(() => ({
        start: mockStart,
        stop: mockStop,
        onChannelBitsUse: mockOnChannelBitsUse
    }))
}));

jest.mock("../main", () => ({
    firebot: {
        firebot: {
            accounts: {
                streamer: {
                    userId: "test-streamer-id"
                }
            }
        },
        modules: {
            twitchApi: {
                getClient: jest.fn().mockReturnValue({
                    mockApiClient: true
                })
            },
            eventManager: {
                triggerEvent: jest.fn()
            }
        }
    },
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

// Import after mocking
import { firebot } from "../main";
const mockEventManagerTriggerEvent = firebot.modules.eventManager.triggerEvent as jest.MockedFunction<typeof firebot.modules.eventManager.triggerEvent>;

describe("Full End-to-End Integration Tests", () => {
    let capturedBitsHandler: ((event: any) => Promise<void>) | undefined;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset the captured handler
        capturedBitsHandler = undefined;

        // Setup mocks
        mockStart.mockResolvedValue(undefined);
        mockSubscriptionStop.mockImplementation(() => { /* no-op */ });
        mockOnChannelBitsUse.mockImplementation((userId: string, handler: (event: any) => Promise<void>) => {
            capturedBitsHandler = handler;
            return { stop: mockSubscriptionStop };
        });
    });

    describe("Complete EventSub to EventManager Flow", () => {
        it("should handle complete flow from EventSub event to eventManager trigger", async () => {
            // Arrange: Initialize EventSub client
            await twitchEventSubClient.createClient();

            // Verify EventSub setup
            expect(mockStart).toHaveBeenCalled();
            expect(mockOnChannelBitsUse).toHaveBeenCalledWith(
                "test-streamer-id",
                expect.any(Function)
            );
            expect(capturedBitsHandler).toBeDefined();

            // Arrange: Create a realistic Twitch EventSub combo event
            const comboEvent = {
                type: "combo",
                userName: "combomaster",
                userId: "12345678",
                userDisplayName: "ComboMaster",
                bits: 500
            };

            // Act: Simulate EventSub delivering the combo event
            if (capturedBitsHandler) {
                await capturedBitsHandler(comboEvent);
            }

            // Assert: Verify the complete flow worked end-to-end
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledTimes(1);
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledWith(
                "combo-event",
                "bits-combo",
                {
                    username: "combomaster",
                    userId: "12345678",
                    userDisplayName: "ComboMaster",
                    isAnonymous: false,
                    bits: 500
                }
            );
        });

        it("should handle realistic combo event scenarios", async () => {
            // Arrange: Initialize EventSub client
            await twitchEventSubClient.createClient();

            // Test Case 1: Small combo
            const smallCombo = {
                type: "combo",
                userName: "viewer1",
                userId: "111111",
                userDisplayName: "Viewer1",
                bits: 10
            };

            // Test Case 2: Large combo
            const largeCombo = {
                type: "combo",
                userName: "bigspender",
                userId: "222222",
                userDisplayName: "BigSpender",
                bits: 10000
            };

            // Test Case 3: Non-combo event (should be ignored)
            const regularBits = {
                type: "regular",
                userName: "regularuser",
                userId: "333333",
                userDisplayName: "RegularUser",
                bits: 100
            };

            // Act: Process all events
            if (capturedBitsHandler) {
                await capturedBitsHandler(smallCombo);
                await capturedBitsHandler(largeCombo);
                await capturedBitsHandler(regularBits);
            }

            // Assert: Only combo events should trigger eventManager
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledTimes(2);

            // Verify first combo event
            expect(mockEventManagerTriggerEvent).toHaveBeenNthCalledWith(1,
                "combo-event",
                "bits-combo",
                {
                    username: "viewer1",
                    userId: "111111",
                    userDisplayName: "Viewer1",
                    isAnonymous: false,
                    bits: 10
                }
            );

            // Verify second combo event
            expect(mockEventManagerTriggerEvent).toHaveBeenNthCalledWith(2,
                "combo-event",
                "bits-combo",
                {
                    username: "bigspender",
                    userId: "222222",
                    userDisplayName: "BigSpender",
                    isAnonymous: false,
                    bits: 10000
                }
            );
        });

        it("should maintain event order and data integrity", async () => {
            // Arrange: Initialize EventSub client
            await twitchEventSubClient.createClient();

            // Create sequence of combo events
            const events = [
                {
                    type: "combo",
                    userName: "user1",
                    userId: "1001",
                    userDisplayName: "User1",
                    bits: 25
                },
                {
                    type: "combo",
                    userName: "user2",
                    userId: "1002",
                    userDisplayName: "User2",
                    bits: 50
                },
                {
                    type: "combo",
                    userName: "user3",
                    userId: "1003",
                    userDisplayName: "User3",
                    bits: 75
                }
            ];

            // Act: Process events in sequence
            if (capturedBitsHandler) {
                for (const event of events) {
                    await capturedBitsHandler(event);
                }
            }

            // Assert: Verify all events were processed in order
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledTimes(3);

            // Check each event maintains data integrity
            events.forEach((originalEvent, index) => {
                expect(mockEventManagerTriggerEvent).toHaveBeenNthCalledWith(index + 1,
                    "combo-event",
                    "bits-combo",
                    {
                        username: originalEvent.userName,
                        userId: originalEvent.userId,
                        userDisplayName: originalEvent.userDisplayName,
                        isAnonymous: false,
                        bits: originalEvent.bits
                    }
                );
            });
        });

        it("should handle EventSub lifecycle with event processing", async () => {
            // Arrange & Act: Initialize, process event, then cleanup
            await twitchEventSubClient.createClient();

            const testEvent = {
                type: "combo",
                userName: "testuser",
                userId: "test123",
                userDisplayName: "TestUser",
                bits: 200
            };

            if (capturedBitsHandler) {
                await capturedBitsHandler(testEvent);
            }

            twitchEventSubClient.disconnectEventSub();

            // Assert: Event was processed and cleanup occurred
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledWith(
                "combo-event",
                "bits-combo",
                expect.objectContaining({
                    username: "testuser",
                    bits: 200
                })
            );

            expect(mockSubscriptionStop).toHaveBeenCalled();
            expect(mockStop).toHaveBeenCalled();
        });
    });
});
