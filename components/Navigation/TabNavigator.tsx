import EnhancedExploreScreen from '../../Screens/ExploreScreen';
import EnhancedTimerScreen from '../../Screens/TimerScreen';
import {HomeStack} from './NavigationStacks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {StyleSheet} from 'react-native';
import {User} from '../../watermelon/models';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

interface Props {
    user: User,
    setUser: any,
    isProMember?: boolean
}

const TabNavigator = ({user, setUser, isProMember}: Props) => {
    Ionicons.loadFont().catch(err => console.log('err', err));
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName: string;
                    if (route.name === 'Timer') {
                        iconName = focused ? 'alarm' : 'stopwatch';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'earth' : 'earth';
                    } else if (route.name === 'Basecamp') {
                        iconName = focused ? 'home' : 'home';
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName!} size={26} color={color}/>;
                },
                tabBarActiveTintColor: 'orange',
                tabBarInactiveTintColor: 'gray',
            })}>
            <Tab.Screen name="Basecamp">
                {() => <HomeStack user={user} setUser={setUser}/>}
            </Tab.Screen>
            <Tab.Screen name="Explore">
                {() => <EnhancedExploreScreen user={user} setUser={setUser}/>}
            </Tab.Screen>
            <Tab.Screen name="Timer" options={{tabBarStyle: {display: 'none'}}}>
                {() => <EnhancedTimerScreen user={user} setUser={setUser}/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
};


export default TabNavigator;

const styles = StyleSheet.create({});
