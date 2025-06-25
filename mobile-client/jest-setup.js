import 'whatwg-fetch'
import dotenv from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
import {darkTheme, lightTheme} from './theme';
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

//react-native purchases
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn().mockResolvedValue({
    activeSubscriptions: ['pro'],
    entitlements: {
      active: {
        pro: {
          identifier: 'pro',
          isActive: true,
        },
      },
    },
  }),
  getOfferings: jest.fn().mockResolvedValue({
    current: {
      availablePackages: [],
    },
  }),
  addCustomerInfoUpdateListener: jest.fn().mockImplementation((cb) => {
    // You could optionally simulate a call here:
    // setTimeout(() => cb({ entitlements: ... }), 0)
    return () => {}; // cleanup function
  }),
  setDebugLogsEnabled: jest.fn(),
  setLogLevel: jest.fn(),
  LOG_LEVEL:{
    DEBUG: 'debug'
  },
  purchaseProduct: jest.fn().mockResolvedValue({
    transactionId: '123',
    customerInfo: {
      activeSubscriptions: ['pro'],
      entitlements: {
        active: {
          pro: {
            identifier: 'pro',
            isActive: true,
          },
        },
      },
    },
  }),
}));

jest.mock('./helpers/RevenueCat/useRevenueCat', () => ({
  __esModule: true, // ← required to make "default" work in CommonJS Jest
  default: () => ({
    isProMember: true,
    currentOffering: {
      identifier: 'pro_monthly',
      description: 'Main offering for Trail Tasks',
      packages: [
        {
          identifier: 'pro_monthly',
          platform_product_identifier: 'com.trailtasks.monthly',
        },
        {
          identifier: 'pro_annual',
          platform_product_identifier: 'com.trailtasks.annual',
        },
      ],
    },
    customerInfo: {
      activeSubscriptions: ['pro'],
      entitlements: {
        active: {
          pro: {
            identifier: 'pro',
            isActive: true,
          },
        },
      },
    },
  }),
}));

//theme
jest.mock('./contexts/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'lightTheme',
    toggleTheme: jest.fn(), // noop
  }),
}));

