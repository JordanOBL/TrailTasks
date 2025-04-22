import 'whatwg-fetch'
import dotenv from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
dotenv.config({ path: '.env.test' });
// Polyfill for TextEncoder and TextDecoder for pg
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


// Also polyfill clearImmediate
global.clearImmediate = global.clearImmediate || ((timer) => clearTimeout(timer));
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

jest.mock(
  '@nozbe/watermelondb/adapters/sqlite/makeDispatcher/index.native.js',
  () => {
    return jest.requireActual(
      '@nozbe/watermelondb/adapters/sqlite/makeDispatcher/index.js',
    );
  },
);

jest.mock('./components/NationalParksInfiniteScroll', () => {
  return jest.fn(() => <></>); // Mock as an empty component
});

jest.mock(
  '@nozbe/watermelondb/adapters/sqlite/makeDispatcher/index.native.js',
  () => jest.requireActual('@nozbe/watermelondb/adapters/sqlite/makeDispatcher/index.js')
)


// RNGH
jest.mock('react-native-gesture-handler', () => {
  // Return an empty mock or partial mocks for the specific imports you use.
  return {
    // For example, if you use GestureHandlerRootView:
    GestureHandlerRootView: ({ children }) => children,
    // or just an empty object if you don't need specifics
  };
});

// RNNetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    callback({
      isConnected: true,
      details: { ipAddress: '192.168.1.1' },
    });
    return jest.fn(); // Mock unsubscribe
  }),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      details: { ipAddress: '192.168.1.1' },
    })
  ),
}));



// RNBootSplash
jest.mock('react-native-bootsplash', () => {
  return {
    hide: jest.fn(() => Promise.resolve(true)),
    show: jest.fn(() => Promise.resolve(true)),
    // or any other exports if needed
  }
})

//RN file system
jest.mock('react-native-fs', () => {
  return {
    exists: jest.fn(() => Promise.resolve(true)),
    DocumentDirectoryPath: '.', // or some folder you can write to
    CachesDirectoryPath: '.',
    // or any other exports if needed
  }
})

//RN keep awake
jest.mock('@sayem314/react-native-keep-awake', () => {
  return {
    activate: jest.fn(() => Promise.resolve(true)),
    useKeepAwake: jest.fn(),
    // or any other exports if needed
  }
})

//RN stack
// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => {
        if (typeof children === 'function') {
          return children(); // Invoke the render prop
        }
        return children;
      },
    }),
  };
});

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => {
        if (typeof children === 'function') {
          return children(); // Invoke the render prop
        }
        return children;
      },
    }),
  };
});

// **Mock react-native-vector-icons with loadFont**
jest.mock('react-native-vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  // Create a mock component that displays the icon name as text
  const createIconSet = () => {
    const MockIcon = (props) => <Text>{props.name}</Text>;
    MockIcon.loadFont = jest.fn(() => Promise.resolve()); // Mock loadFont
    return MockIcon;
  };

  return {
    Ionicons: createIconSet(),
    MaterialIcons: createIconSet(),
    FontAwesome: createIconSet(),
    // Add other icon sets as needed
  };
});

// **Mock react-native-reanimated-carousel**
jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({ children, ...props }) => {
      return <View {...props}>{children}</View>;
    },
  };
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      setOptions: jest.fn(),
      // Add other navigation methods if needed
    }),
  };
});

jest.mock('react-native-background-geolocation', () => {
  return {
    __esModule: true, // if you're using ES modules
  default: {
    on: jest.fn(),
    onLocation: jest.fn(),
    onMotionChange: jest.fn(),
    onActivityChange: jest.fn(),
    onProviderChange: jest.fn(),
    ready: jest.fn(() => Promise.resolve({ enabled: true })),
    start: jest.fn(),
    stop: jest.fn(),
    LOG_LEVEL_VERBOSE: 1,
    removeListeners: jest.fn(),
  },
    Subscription: {
      remove: jest.fn()
    },
    Location: {
      coords: {
        latitude: 0,
        longitude: 0
      }
    }
  }
})
