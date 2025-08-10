import AddOnStoreScreen from '../../Screens/AddOnStoreScreen';
import EnhancedAchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedTrailsScreen from '../../Screens/CompletedTrailsScreen';
import EnhancedFriendsScreen from '../../Screens/FriendsScreen';
import EnhancedHomeScreen from '../../Screens/HomeScreen';
import EnhancedLeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedProfileScreen from '../../Screens/ProfileScreen';
import EnhancedStatsScreen from '../../Screens/StatsScreen';
import EnhancedSubscribeScreen from '../../Screens/SubscribeScreen';
import EnhancedTrailQueueScreen from '../../Screens/TrailQueueScreen';
import SettingsScreen from '../../Screens/SettingsScreen';
import SubscriptionSettingsScreen from '../../Screens/SubscriptionSettingsScreen';
import {User} from '../../watermelon/models';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';
const HomeStack = createStackNavigator();

export function HomeStackNavigator() {
  const {user} = useAuthContext();
  return (
    <HomeStack.Navigator >
      <HomeStack.Screen name="Home" options={{headerShown: false, headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedHomeScreen  testId="homescreen" user={user} {...props}  />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="Profile" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedProfileScreen user={user} {...props} />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen
        name="Achievements"
        options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedAchievementsScreen user={user} {...props}  />
        )}
      </HomeStack.Screen>
     
<HomeStack.Screen name="Trail Queue" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedTrailQueueScreen {...props} user={user}  />
        )}
      </HomeStack.Screen>


      <HomeStack.Screen name="Stats" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedStatsScreen {...props} user={user}  />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="Friends"  options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedFriendsScreen {...props} user={user}  />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="CompletedHikes" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedCompletedTrailsScreen
            {...props} user={user}
          />
        )}
      </HomeStack.Screen>
      <HomeStack.Screen name="Leaderboards" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
        {(props: any) => <EnhancedLeaderboardsScreen {...props} user={user} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Subscribe" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <EnhancedSubscribeScreen  {...props} user={user} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Settings" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <SettingsScreen {...props} user={user} />}
      </HomeStack.Screen>
      <HomeStack.Screen
        name="SubscriptionSettings"
        options={{ headerTitleAlign: "center", headerBackButtonDisplayMode: "minimal" }}
      >
        {(props: any) => <SubscriptionSettingsScreen {...props} user={user} />}
      </HomeStack.Screen>

      <HomeStack.Screen name="Shop" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
        {(props: any) => <AddOnStoreScreen {...props} user={user} />}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}


