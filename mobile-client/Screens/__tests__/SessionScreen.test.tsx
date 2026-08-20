import { afterAll, describe, expect, jest, test} from '@jest/globals';
import { createMockUserBase } from '../../__mocks__/UserModel';
import { render, screen} from '@testing-library/react-native'

import SessionScreen from '../SessionScreen';
import { Session_Category, Trail, User } from '../../watermelon/models';

const mockUser = createMockUserBase({ trailId: "1" });
const mockTrail: Trail = { trailName: "TestTrail", id: "1", park: { id: 1, parkName:'MockPark'} } as Trail;
jest.mock('../../contexts/ThemeProvider', () => {
    return {
        useTheme: () => ({ theme: 'dark' }),
    };
});
const mockDb = {
    get: jest.fn().mockImplementation((arg) =>
    {
        if (arg === 'trails')
        {
            return {
                query: () => ({
                    fetch: () => [mockTrail],
                }),
            }
    
        } else if (arg === 'session_categories')
        {
            return {
                query: () => ({
                    fetch: (): Session_Category[] => [{id: '1', sessionCategoryName: 'gaming'}] as Session_Category[],
                }),
            }
        }

    })
};
jest.mock("@nozbe/watermelondb/react", () => {
  return {
      useDatabase: jest.fn(() => mockDb),
      withObservables: jest.fn(() => jest.fn())
  };
});

const mockPersistenceCleanup = jest.fn();
const mockRewardCleanup = jest.fn();

const mockPersistenceRegister = jest.fn(() => mockPersistenceCleanup);
const mockRewardRegister = jest.fn(() => mockRewardCleanup);

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => ({
    user: mockUser as User,
    isProMember: false,
  }),
}));

jest.mock("../../persistenceService/persistenceService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockPersistenceRegister,
  }));
});

jest.mock("../../contexts/ServiceProvider", () => {
    return {
        useServices: jest.fn(() =>
        ({
            sessionEngineMgr: {
                resetCurrentSessionEngine: jest.fn()
            },
            bus: {
                on: jest.fn(() => ({ unregister: jest.fn()}))
            },
            persistenceService: jest.fn()
        }))
    }
});

jest.mock("../../services/RewardService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockRewardRegister,
  }));
});

jest.mock('../../components/DistanceProgressBar', () => {
    return jest.fn(() => { return (<></>) } )
    
});

afterAll(() =>
{
    jest.clearAllMocks();
})

describe('SessionScreen', () =>
{
    test("Initially renders session options by default", async () =>
    {
        render(
            <SessionScreen />
        );
        
        expect(await screen.findByText("Start Session")).toBeTruthy();
        expect(await screen.findByTestId("settings-modal")).toBeDefined();
    });
    test("Spinner disappears and error appears", async () =>
    {
    mockDb.get.mockImplementation((arg) => {
        if (arg === 'session_categories') {
          return {
            query: () => ({
              fetch: (): Session_Category[] => [{id: '1', sessionCategoryName: 'gaming'}] as Session_Category[],
            }),
          };
        }

        if (arg === 'trails') {
          return {
            query: () => ({
              fetch: () => [],
            }),
          };
        }

        throw new Error(`Unexpected collection: ${arg}`);
      });

      render(<SessionScreen />);

      expect(await screen.findByText("Cannot Create New Session")).toBeTruthy();
      expect(await screen.findByText("Try Restarting App")).toBeTruthy();
    });

})
