/// <reference types="jest" />

import { ServiceContext, ServiceProvider, useServices } from "./ServiceProvider";
import { render, waitFor } from "@testing-library/react-native";
import { User } from "../watermelon/models";

const mockPersistenceCleanup = jest.fn();
const mockRewardCleanup = jest.fn();

const mockPersistenceRegister = jest.fn(() => mockPersistenceCleanup);
const mockRewardRegister = jest.fn(() => mockRewardCleanup);

const user = { id: "1" };
const mockDb = { adapter: {} };

jest.mock("@nozbe/watermelondb/react", () => {
  return {
    useDatabase: jest.fn(() => mockDb),
  };
});

jest.mock("../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    user: user as User,
    isProMember: false,
  })),
}));

jest.mock("../persistenceService/persistenceService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockPersistenceRegister,
  }));
});

jest.mock("../sessionEngine/SessionEngineManager", () => {
  return jest.fn().mockImplementation(() => ({
    id: "mock-session-engine-manager",
  }));
});

jest.mock("../services/RewardService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockRewardRegister,
  }));
});

describe("ServiceProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Initializes services for consumers after user and db are available", async () => {
    const observeServices = jest.fn();
    const TestConsumer = () => {
      const services = useServices();
      observeServices(services);
      return null;
    };
    render(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let firstRenderedServices;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      firstRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(firstRenderedServices.persistenceService).not.toBeNull();
      expect(firstRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(firstRenderedServices.rewardService).not.toBeNull();
    });
  });

  test("recreates services after user changes", async () => {
    const observeServices = jest.fn();
    const TestConsumer = () => {
      const services = useServices();
      observeServices(services);
      return null;
    };
    const { rerender } = render(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let firstRenderedServices: Omit<ServiceContext, "bus">;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      firstRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(firstRenderedServices.persistenceService).not.toBeNull();
      expect(firstRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(firstRenderedServices.rewardService).not.toBeNull();
    });

    user.id = "2";

    rerender(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let secondRenderedServices: Omit<ServiceContext, "bus">;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      secondRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(secondRenderedServices.persistenceService).not.toBeNull();
      expect(secondRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(secondRenderedServices.rewardService).not.toBeNull();

      expect(
        firstRenderedServices?.persistenceService).not.toBe(secondRenderedServices?.persistenceService);
      expect(firstRenderedServices?.sessionEngineMgr).not.toBe(secondRenderedServices?.sessionEngineMgr);
      expect(firstRenderedServices?.rewardService).not.toBe(secondRenderedServices?.rewardService);
    });
  });
});
