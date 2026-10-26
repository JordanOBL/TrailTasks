import { createNewUser } from "./auth";

jest.mock("@nozbe/watermelondb", () => ({ Q: {} }));
jest.mock("../watermelon/models", () => ({}));
jest.mock("../config/environment", () => ({ API_BASE_URL: "https://staging.example.invalid" }));
jest.mock("../helpers/ErrorHandler", () => ({ __esModule: true, default: jest.fn() }));

describe("new-account theme preference", () => {
  test("persists dark as the default theme for a newly registered user", async () => {
    const user: Record<string, unknown> = { id: "new-user" };
    const transaction: Record<string, unknown> = { id: "registration-bonus" };
    const database = {
      write: jest.fn(async (writer: () => Promise<unknown>) => writer()),
      get: jest.fn((table: string) => ({
        create: jest.fn(async (initialize: (record: Record<string, unknown>) => void) => {
          const record = table === "users" ? user : transaction;
          initialize(record);
          return record;
        }),
      })),
    };
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    try {
      const created = await createNewUser({
        email: "unit@example.invalid",
        password: "unit-test-only",
        username: "unit-hiker",
        watermelonDatabase: database as unknown as Parameters<
          typeof createNewUser
        >[0]["watermelonDatabase"],
      });
      expect(created).toBe(user);
      expect(user.themePreference).toBe("dark");
      expect(log.mock.calls.flat()).not.toContain("unit-test-only");
      expect(log.mock.calls.flat()).not.toContain("unit@example.invalid");
    } finally {
      log.mockRestore();
    }
  });
});
