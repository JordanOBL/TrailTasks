import 'whatwg-fetch'

// Also polyfill clearImmediate
global.clearImmediate = global.clearImmediate || ((timer) => clearTimeout(timer));
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));


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
jest.mock('@react-native-community/netinfo', () => {
  return {
    addEventListener: jest.fn(),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    // or any other methods you need
  }
})

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
    // or any other exports if needed
  }
})

//RN keep awake
jest.mock('@sayem314/react-native-keep-awake', () => {
  return {
    activate: jest.fn(() => Promise.resolve(true)),
    // or any other exports if needed
  }
})

//RN stack

jest.mock('@react-navigation/stack', () => {
  return {
    NavigationContainer: jest.fn((props) => props.children),
    createStackNavigator: () => ({
      Navigator: jest.fn((navigatorProps) => navigatorProps.children),
      Screen: jest.fn((screenProps) => screenProps.children),
    }),
  }
})

// jest-setup.js (or wherever you configure global mocks)
jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: jest.fn(() => {
      return {
        // Commonly used in your code as <Tab.Navigator> ... </Tab.Navigator>
        Navigator: jest.fn().mockImplementation(({ children }) => children),
        // Commonly used in your code as <Tab.Screen> ... </Tab.Screen>
        Screen: jest.fn().mockImplementation(({ children }) => children),
      };
    }),
  };
});


