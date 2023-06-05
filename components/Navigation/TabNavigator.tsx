import {StyleSheet} from 'react-native';
import React from 'react';
import ExploreScreen from '../../Screens/ExploreScreen';
import TimerScreen from '../../Screens/TimerScreen';
import {HomeStack} from './NavigationStacks';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { User } from '../../watermelon/models';
const Tab = createBottomTabNavigator();
interface Props {
  user: User

}

const TabNavigator = ({user}:Props) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;
          if (route.name === 'Timer') {
            iconName = focused ? 'alarm' : 'stopwatch';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'globe' : 'globe';
          } else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName!} size={30} color={color} />;
        },
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home">
        {() => <HomeStack user={user}  />}
      </Tab.Screen>
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});
