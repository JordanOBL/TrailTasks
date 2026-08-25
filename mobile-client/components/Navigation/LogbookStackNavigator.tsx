import EnhancedWildsScreen from "../../Screens/WildsScreen";
import LogbookScreen from "../../Screens/LogbookScreen";
import ParkDetailsScreen from "../../Screens/ParksScreen";
import ParkPassScreen from "../../Screens/ParksScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthContext } from "../../services/AuthContext";
const Logbook = createStackNavigator();

export default function LogbookStackNavigator() {
  const { user } = useAuthContext();
  return (
    <Logbook.Navigator>
      <Logbook.Screen name="MyLogbook" options={{ headerShown: false }}>
        {(props: any) => <LogbookScreen {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="MyWilds">
        {(props: any) => <EnhancedWildsScreen user={user} {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="Parks" options={{}}>
        {(props: any) => <ParkPassScreen {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="ParkDetails" options={{}}>
        {(props: any) => <ParkDetailsScreen {...props} />}
      </Logbook.Screen>
    </Logbook.Navigator>
  );
}
