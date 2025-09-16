import { twitchEventSubClient } from "../eventsub";
import { triggerBitsCombo } from "../event";

// Mock the Twurple libraries
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

// Mock the event module
jest.mock("../event", () => ({
    triggerBitsCombo: jest.fn()
}));

// Mock the main module exports
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

// Type the mocked function
const mockTriggerBitsCombo = triggerBitsCombo as jest.MockedFunction<typeof triggerBitsCombo>;

describe("TwitchEventSubClient End-to-End Tests", () => {
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

    describe("Bits Combo Event Flow", () => {
        it("should handle bits combo event end-to-end", async () => {
            // Arrange: Create client to set up the event handler
            await twitchEventSubClient.createClient();

            // Verify the subscription was created
            expect(mockOnChannelBitsUse).toHaveBeenCalledWith(
                "test-streamer-id",
                expect.any(Function)
            );

            // Ensure we captured the handler
            expect(capturedBitsHandler).toBeDefined();

            // Arrange: Prepare test event data
            const testBitsEvent = {
                type: "combo",
                userName: "testuser",
                userId: "test-user-id-123",
                userDisplayName: "TestUser",
                bits: 100
            };

            // Act: Simulate receiving a bits event from Twitch EventSub
            if (capturedBitsHandler) {
                await capturedBitsHandler(testBitsEvent);
            }

            // Assert: Verify triggerBitsCombo was called with correct parameters
            expect(mockTriggerBitsCombo).toHaveBeenCalledTimes(1);
            expect(mockTriggerBitsCombo).toHaveBeenCalledWith(
                "testuser",
                "test-user-id-123",
                "TestUser",
                100
            );
        });

        it("should ignore non-combo bits events", async () => {
            // Arrange: Create client
            await twitchEventSubClient.createClient();

            // Arrange: Prepare test event data for non-combo event
            const testBitsEvent = {
                type: "regular",
                userName: "testuser",
                userId: "test-user-id-123",
                userDisplayName: "TestUser",
                bits: 50
            };

            // Act: Simulate receiving a non-combo bits event
            if (capturedBitsHandler) {
                await capturedBitsHandler(testBitsEvent);
            }

            // Assert: Verify triggerBitsCombo was NOT called
            expect(mockTriggerBitsCombo).not.toHaveBeenCalled();
        });

        it("should handle multiple combo events correctly", async () => {
            // Arrange: Create client
            await twitchEventSubClient.createClient();

            // Arrange: Prepare multiple test events
            const event1 = {
                type: "combo",
                userName: "user1",
                userId: "user-id-1",
                userDisplayName: "User1",
                bits: 25
            };

            const event2 = {
                type: "combo",
                userName: "user2",
                userId: "user-id-2",
                userDisplayName: "User2",
                bits: 75
            };

            // Act: Simulate receiving multiple events
            if (capturedBitsHandler) {
                await capturedBitsHandler(event1);
                await capturedBitsHandler(event2);
            }

            // Assert: Verify both events were processed
            expect(mockTriggerBitsCombo).toHaveBeenCalledTimes(2);
            expect(mockTriggerBitsCombo).toHaveBeenNthCalledWith(1, "user1", "user-id-1", "User1", 25);
            expect(mockTriggerBitsCombo).toHaveBeenNthCalledWith(2, "user2", "user-id-2", "User2", 75);
        });
    });

    describe("EventSub Client Lifecycle", () => {
        it("should properly initialize and start EventSub listener", async () => {
            // Act: Create client
            await twitchEventSubClient.createClient();

            // Assert: Verify listener was started
            expect(mockStart).toHaveBeenCalled();
        });

        it("should properly cleanup subscriptions on disconnect", async () => {
            // Arrange: Create client
            await twitchEventSubClient.createClient();

            // Act: Disconnect
            twitchEventSubClient.disconnectEventSub();

            // Assert: Verify subscription and listener cleanup
            expect(mockSubscriptionStop).toHaveBeenCalled();
            expect(mockStop).toHaveBeenCalled();
        });

        it("should handle EventSub connection errors gracefully", async () => {
            // Arrange: Make the start method throw an error synchronously
            const errorMessage = "Failed to connect to EventSub";
            mockStart.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            // Act: Attempt to create client
            await twitchEventSubClient.createClient();

            // Assert: Verify triggerBitsCombo wasn't called due to connection failure
            expect(mockTriggerBitsCombo).not.toHaveBeenCalled();
        });

        it("should disconnect existing connection before creating new one", async () => {
            // Arrange: Create initial connection
            await twitchEventSubClient.createClient();

            // Act: Create client again
            await twitchEventSubClient.createClient();

            // Assert: Verify stop was called before starting again
            expect(mockStop).toHaveBeenCalled();
            expect(mockStart).toHaveBeenCalledTimes(2);
        });
    });

    describe("Subscription Management", () => {
        it("should create bits subscription with correct streamer ID", async () => {
            // Act: Create client
            await twitchEventSubClient.createClient();

            // Assert: Verify subscription was created with correct parameters
            expect(mockOnChannelBitsUse).toHaveBeenCalledWith(
                "test-streamer-id",
                expect.any(Function)
            );
        });

        it("should handle subscription cleanup errors silently", async () => {
            // Arrange: Make subscription stop throw an error
            mockSubscriptionStop.mockImplementation(() => {
                throw new Error("Subscription stop failed");
            });

            // Act: Create client and then remove subscriptions
            await twitchEventSubClient.createClient();

            // Should not throw when cleaning up
            expect(() => {
                twitchEventSubClient.removeSubscriptions();
            }).not.toThrow();
        });

        it("should handle listener stop errors gracefully", async () => {
            // Arrange: Make listener stop throw an error
            mockStop.mockImplementation(() => {
                throw new Error("Listener stop failed");
            });

            // Act: Create client and then disconnect
            await twitchEventSubClient.createClient();

            // Should not throw when disconnecting
            expect(() => {
                twitchEventSubClient.disconnectEventSub();
            }).not.toThrow();
        });
    });
});
