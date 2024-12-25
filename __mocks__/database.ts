export function createMockDatabase(){
  return {
    write: jest.fn((cb) => cb()),
    batch: jest.fn(),
    localStorage: {
      set: jest.fn(),
      get: jest.fn(),
    },
    collections: {
      get: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnThis(),
      create: jest.fn(),
    },
  }
}
