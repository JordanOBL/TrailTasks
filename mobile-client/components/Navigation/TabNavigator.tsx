import { HomeStackNavigator } from './HomeStackNavigator';
import { SessionStackNavigator } from './SessionStackNavigator';
import ExploreStackNavigator from './ExploreStackNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../contexts/ThemeProvider'; // import your theme context

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useTheme(); // Get theme from context
  Ionicons.loadFont().catch(err => console.log('err', err));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Timer') {
            iconName = focused ? 'alarm' : 'stopwatch';
          } else if (route.name === 'Explore') {
            iconName = 'earth';
          } else if (route.name === 'Basecamp') {
            iconName = 'home';
          }

          return <Ionicons name={iconName!} size={26} color={color} />;
        },
        tabBarActiveTintColor: theme.button,
        tabBarInactiveTintColor: theme.secondaryText,
        headerShown: false,
        unmountOnBlur: false,
      })}
    >
      <Tab.Screen name="Basecamp" children={() => <HomeStackNavigator />} />
      <Tab.Screen name="Explore" children={() => <ExploreStackNavigator />} />
      <Tab.Screen name="Timer" children={() => <SessionStackNavigator />} />
    </Tab.Navigator>
  );
};

export default TabNavigator;


