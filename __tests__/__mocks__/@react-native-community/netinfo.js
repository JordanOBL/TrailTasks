// __mocks__/@react-native-community/netinfo.js

export default {
    addEventListener: jest.fn(),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    getConnectionInfo: jest.fn(() => Promise.resolve({ type: 'wifi' })),
    removeEventListener: jest.fn(),
    useNetInfo: jest.fn(() => ({
        isConnected: true,
    })),
};