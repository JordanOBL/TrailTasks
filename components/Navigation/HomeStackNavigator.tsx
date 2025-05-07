import AddOnStoreScreen from '../../Screens/AddOnStoreScreen';
import EnhancedAchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedTrailsScreen from '../../Screens/CompletedTrailsScreen';
import EnhancedHikingQueueScreen from '../../Screens/HikingQueueScreen';
import EnhancedHomeScreen from '../../Screens/HomeScreen';
import EnhancedLeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedStatsScreen from '../../Screens/StatsScreen';
import EnhancedSubscribeScreen from '../../Screens/SubscribeScreen';
import EnhancedFriendsScreen from '../../Screens/FriendsScreen';
import EnhancedParkPassScreen from "../../Screens/ParkPassScreen";
import SubscriptionSettingsScreen from '../../Screens/SubscriptionSettingsScreen';

import SettingsScreen from '../../Screens/SettingsScreen';
import {User} from '../../watermelon/models';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';

const Home = createStackNavigator();

export function HomeStackNavigator() {
  const {user} = useAuthContext();
  return (
    <Home.Navigator >
      <Home.Screen name="Home" options={{headerShown: false, headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedHomeScreen  testId="homescreen" user={user} {...props}  />
        )}
      </Home.Screen>

      <Home.Screen
        name="Achievements"
        options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedAchievementsScreen user={user} {...props}  />
        )}
      </Home.Screen>
      <Home.Screen
        name="Park Passes"
        options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedParkPassScreen {...props}  user={user}/>
        )}
      </Home.Screen>



      <Home.Screen name="Stats" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedStatsScreen {...props} user={user}  />
        )}
      </Home.Screen>
      <Home.Screen name="Friends"  options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedFriendsScreen {...props} user={user}  />
        )}
      </Home.Screen>
      <Home.Screen name="CompletedHikes" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedCompletedTrailsScreen
            {...props} user={user}
          />
        )}
      </Home.Screen>
      <Home.Screen name="Leaderboards" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
        {(props: any) => <EnhancedLeaderboardsScreen {...props} user={user} />}
      </Home.Screen>
      <Home.Screen name="Subscribe" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <EnhancedSubscribeScreen  {...props} user={user} />}
      </Home.Screen>
      <Home.Screen name="Settings" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <SettingsScreen {...props} user={user} />}
      </Home.Screen>
      <Home.Screen
        name="SubscriptionSettings"
        options={{ headerTitleAlign: "center", headerBackButtonDisplayMode: "minimal" }}
      >
        {(props: any) => <SubscriptionSettingsScreen {...props} user={user} />}
      </Home.Screen>

      <Home.Screen name="Shop" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
        {(props: any) => <AddOnStoreScreen {...props} user={user} />}
      </Home.Screen>
    </Home.Navigator>
  );
}


