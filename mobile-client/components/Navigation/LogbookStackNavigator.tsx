import EnhancedLogbookScreen from '../../Screens/LogbookScreen';
import EnhancedParkPassScreen from '../../Screens/ParksScreen';
import EnhancedWildsScreen from '../../Screens/WildsScreen';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';
const Logbook = createStackNavigator();

export default function LogbookStackNavigator() {
  const {user} = useAuthContext();
  return (
    <Logbook.Navigator>
      <Logbook.Screen name="Logbook" options={{headerShown: false}}>
        {(props: any) => <EnhancedLogbookScreen user={user} {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="MyWilds">
        {(props: any) => <EnhancedWildsScreen user={user} {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="Parks" options={{}}>
        {(props: any) => <EnhancedParkPassScreen user={user} {...props} />}
      </Logbook.Screen>
    </Logbook.Navigator>
  );
}
