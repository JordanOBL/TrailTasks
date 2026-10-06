import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { InternetConnectionProvider, useInternetConnection } from './InternetConnectionProvider';

const ConnectionStatus = () => {
  const { isConnected } = useInternetConnection();
  return <Text testID="connection-status">{isConnected ? 'online' : 'offline'}</Text>;
};

describe('InternetConnectionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('treats connected-but-not-internet-reachable NetInfo state as offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: false,
      details: { ipAddress: '192.168.1.10' },
    });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());

    const screen = render(
      <InternetConnectionProvider>
        <ConnectionStatus />
      </InternetConnectionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('offline');
    });
  });

  it('updates consumers when NetInfo emits a reconnect event', async () => {
    let netInfoListener: (state: any) => void = () => {};
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
      details: {},
    });
    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      netInfoListener = callback;
      callback({ isConnected: false, isInternetReachable: false, details: {} });
      return jest.fn();
    });

    const screen = render(
      <InternetConnectionProvider>
        <ConnectionStatus />
      </InternetConnectionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('offline');
    });

    act(() => {
      netInfoListener({
        isConnected: true,
        isInternetReachable: true,
        details: { ipAddress: '192.168.1.10' },
      });
    });

    expect(screen.getByTestId('connection-status')).toHaveTextContent('online');
  });

  it('polls NetInfo while offline so reconnect can recover even if an event is missed', async () => {
    jest.useFakeTimers();
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({ isConnected: false, isInternetReachable: false, details: {} })
      .mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
        details: { ipAddress: '192.168.1.10' },
      });
    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      callback({ isConnected: false, isInternetReachable: false, details: {} });
      return jest.fn();
    });

    const screen = render(
      <InternetConnectionProvider>
        <ConnectionStatus />
      </InternetConnectionProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('connection-status')).toHaveTextContent('offline');

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByTestId('connection-status')).toHaveTextContent('online');
    expect(NetInfo.fetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
