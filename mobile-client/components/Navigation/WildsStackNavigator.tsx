import EnhancedWildsScreen from '../../Screens/WildsScreen';
import React from 'react';
import {User} from '../../watermelon/models';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';
const Wilds = createStackNavigator();

export default function WildsStackNavigator()
{
    const {user} = useAuthContext();
  return (
    <Wilds.Navigator>
      <Wilds.Screen name="Wilds">
        {(props:any) => <EnhancedWildsScreen user={user} {...props} />}
      </Wilds.Screen>


    </Wilds.Navigator>
  );
}

