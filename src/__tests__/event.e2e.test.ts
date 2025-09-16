import { triggerBitsCombo } from "../event";

// Mock the main module to mock firebot
jest.mock("../main", () => ({
    firebot: {
        modules: {
            eventManager: {
                triggerEvent: jest.fn()
            }
        }
    }
}));

// Import after mocking
import { firebot } from "../main";
const mockEventManagerTriggerEvent = firebot.modules.eventManager.triggerEvent as jest.MockedFunction<typeof firebot.modules.eventManager.triggerEvent>;

describe("Event Module End-to-End Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("triggerBitsCombo", () => {
        it("should trigger eventManager event with correct metadata", () => {
            // Arrange: Prepare test data
            const username = "testuser";
            const userId = "test-user-id-123";
            const userDisplayName = "TestUser";
            const bits = 100;

            // Act: Call triggerBitsCombo
            triggerBitsCombo(username, userId, userDisplayName, bits);

            // Assert: Verify eventManager.triggerEvent was called with correct parameters
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledTimes(1);
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledWith(
                "combo-event",
                "bits-combo",
                {
                    username: "testuser",
                    userId: "test-user-id-123",
                    userDisplayName: "TestUser",
                    isAnonymous: false,
                    bits: 100
                }
            );
        });

        it("should handle different user data correctly", () => {
            // Arrange: Prepare different test data
            const username = "anotheruser";
            const userId = "different-user-id";
            const userDisplayName = "AnotherUser";
            const bits = 250;

            // Act: Call triggerBitsCombo
            triggerBitsCombo(username, userId, userDisplayName, bits);

            // Assert: Verify correct data transformation
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledWith(
                "combo-event",
                "bits-combo",
                {
                    username: "anotheruser",
                    userId: "different-user-id",
                    userDisplayName: "AnotherUser",
                    isAnonymous: false,
                    bits: 250
                }
            );
        });

        it("should always set isAnonymous to false", () => {
            // Act: Call triggerBitsCombo
            triggerBitsCombo("user", "id", "User", 50);

            // Assert: Verify isAnonymous is always false
            const callArgs = mockEventManagerTriggerEvent.mock.calls[0];
            const eventData = callArgs[2];
            expect(eventData.isAnonymous).toBe(false);
        });

        it("should handle multiple triggers correctly", () => {
            // Act: Call triggerBitsCombo multiple times
            triggerBitsCombo("user1", "id1", "User1", 25);
            triggerBitsCombo("user2", "id2", "User2", 75);

            // Assert: Verify both events were triggered
            expect(mockEventManagerTriggerEvent).toHaveBeenCalledTimes(2);

            expect(mockEventManagerTriggerEvent).toHaveBeenNthCalledWith(1,
                "combo-event",
                "bits-combo",
                {
                    username: "user1",
                    userId: "id1",
                    userDisplayName: "User1",
                    isAnonymous: false,
                    bits: 25
                }
            );

            expect(mockEventManagerTriggerEvent).toHaveBeenNthCalledWith(2,
                "combo-event",
                "bits-combo",
                {
                    username: "user2",
                    userId: "id2",
                    userDisplayName: "User2",
                    isAnonymous: false,
                    bits: 75
                }
            );
        });
    });
});
