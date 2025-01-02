import { HomeStackNavigator } from './HomeStackNavigator';
import { SessionStackNavigator } from './SessionStackNavigator';
import EnhancedSessionScreen from '../../Screens/SessionScreen';
import ExploreStackNavigator from './ExploreStackNavigator'; // Import the new stack navigator
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet } from 'react-native';
import { User } from '../../watermelon/models';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const TabNavigator = () => 
{
    // Grab user from the hook
    Ionicons.loadFont().catch(err => console.log('err', err));
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    if (route.name === 'Timer') {
                        iconName = focused ? 'alarm' : 'stopwatch';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'earth' : 'earth';
                    } else if (route.name === 'Basecamp') {
                        iconName = focused ? 'home' : 'home';
                    }

                    return <Ionicons name={iconName!} size={26} color={color} />;
                },
                tabBarActiveTintColor: 'cyan',
                tabBarInactiveTintColor: 'gray',
            })}>
            <Tab.Screen name="Basecamp" options={{headerShown: false, unmountOnBlur: false}}>
                {() => <HomeStackNavigator  />}
            </Tab.Screen>
            <Tab.Screen name="Explore" options={{headerShown: false, unmountOnBlur: false}}>
                {() => <ExploreStackNavigator   />}
            </Tab.Screen>
            <Tab.Screen name="Timer" options={{ tabBarStyle: { display: 'flex' }, headerShown: false, unmountOnBlur: false }}>
                {() => <SessionStackNavigator  />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default TabNavigator;

