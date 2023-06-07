import {StyleSheet} from 'react-native';
import React from 'react';
import EnhancedExploreScreen from '../../Screens/ExploreScreen';
import EnhancedTimerScreen from '../../Screens/TimerScreen';
import {HomeStack} from './NavigationStacks';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {User} from '../../watermelon/models';
const Tab = createBottomTabNavigator();
interface Props {
  user: User;
  setUser: any;
}

const TabNavigator = ({user, setUser}: Props) => {
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
        {() => <HomeStack user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Explore">
        {() => <EnhancedExploreScreen user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Timer">
        {() => <EnhancedTimerScreen user={user} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};



export default TabNavigator;

const styles = StyleSheet.create({});
