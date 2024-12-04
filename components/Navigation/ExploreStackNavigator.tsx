import { createStackNavigator } from '@react-navigation/stack';
import EnhancedExploreScreen from '../../Screens/ExploreScreen';
import React from 'react';
import EnhancedTrailDetailScreen from "../../Screens/TrailDetailScreen";

const ExploreStack = createStackNavigator();

// @ts-ignore
const ExploreStackNavigator = ({ user, setUser }) => {
    return (
        <ExploreStack.Navigator>
            <ExploreStack.Screen
                name="ExploreMain"
                options={{ headerShown: false, unmountOnBlur: false }}
            >
                {(props) => <EnhancedExploreScreen {...props} user={user} setUser={setUser} />}
            </ExploreStack.Screen>
            <ExploreStack.Screen
                name="TrailDetails"
                options={{ headerShown: false, presentation: 'modal', unmountOnBlur: false }} // You can customize the header here
            >
                {(props) => <EnhancedTrailDetailScreen {...props} user={user} />}
            </ExploreStack.Screen>
        </ExploreStack.Navigator>
    );
};

export default ExploreStackNavigator;