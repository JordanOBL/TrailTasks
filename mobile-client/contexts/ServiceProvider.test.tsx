//no-typecheck
import { ServiceProvider, useServices } from "./ServiceProvider";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { User } from "../watermelon/models";

const mockPersistenceCleanup = jest.fn();
const mockRewardCleanup = jest.fn();

const mockPersistenceRegister = jest.fn(() => mockPersistenceCleanup);
const mockRewardRegister = jest.fn(() => mockRewardCleanup);

jest.mock("@nozbe/watermelondb/react", () => {
  return {
    useDatabase: jest.fn(() => ({
        adapter: {}
    })
)};
});

jest.mock("../services/AuthContext", () => ({
    useAuthContext: jest.fn(() => ({
        user: {
          id: "1",
        } as User,
        isProMember: false,
      }))
}));

jest.mock("../persistenceService/persistenceService", () => {
    return jest.fn().mockImplementation(() => ({
        register: mockPersistenceRegister
    }));
});

jest.mock("../sessionEngine/SessionEngineManager", () => {
    return jest.fn().mockImplementation(() => ({
        id: "mock-session-engine-manager"
    }));
});

jest.mock("../services/RewardService", () => {
    return jest.fn().mockImplementation(() => ({
        register: mockRewardRegister
    }));
});

describe("ServiceProvider", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  test("Initializes services for counsumers after user and db are available", async () => {
    const observeServices = jest.fn();
    const TestConsumer = () => {
        const services = useServices();
        observeServices(services);
        return null;
    };
    render(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>
    );

    await waitFor(() => {
        expect(observeServices).toHaveBeenCalled();
        const latestServices: any = observeServices.mock.calls[observeServices.mock.calls.length -  1][0];

        expect(latestServices.persistenceServices).not.toBeNull();
        expect(latestServices.sessionEngineManager).not.toBeNull();
        expect(latestServices.rewardService).not.toBeNull();
    })
  });
});
