import EnhancedExploreScreen from '../../Screens/ExploreScreen';
import React from 'react';
import TrailDetailScreen from '../../Screens/TrailDetailScreen';
import { createStackNavigator } from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';

const ExploreStack = createStackNavigator();

const ExploreStackNavigator = () => {
    const { user } = useAuthContext();
    return (
        <ExploreStack.Navigator>
            <ExploreStack.Screen
                name="ExploreMain"
                options={{ headerShown: false }}
            >
                {(props) => <EnhancedExploreScreen user={user} {...props}  />}
            </ExploreStack.Screen>
            <ExploreStack.Screen
                name="TrailDetails"
                options={{ headerShown: false, presentation: 'modal' }}
            >
                {(props) => <TrailDetailScreen {...props}  />}
            </ExploreStack.Screen>
        </ExploreStack.Navigator>
    );
};

export default ExploreStackNavigator;
