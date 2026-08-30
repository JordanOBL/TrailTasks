import LogbookScreen from "../../Screens/LogbookScreen";
import ParkPassScreen from "../../Screens/ParksScreen";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ParkDetails from "../Parks/ParkDetails";
const Logbook = createStackNavigator();

export default function LogbookStackNavigator() {
  return (
    <Logbook.Navigator>
      <Logbook.Screen name="MyLogbook" options={{ headerShown: false }}>
        {(props: any) => <LogbookScreen {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="Parks" options={{}}>
        {(props: any) => <ParkPassScreen {...props} />}
      </Logbook.Screen>
      <Logbook.Screen name="ParkDetails" options={{}}>
        {(props: any) => <ParkDetails {...props} />}
      </Logbook.Screen>
    </Logbook.Navigator>
  );
}
