import AddOnStoreScreen from '../../Screens/AddOnStoreScreen';
import EnhancedAchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedHikesScreen from '../../Screens/CompletedHikesScreen';
import EnhancedHikingQueueScreen from '../../Screens/HikingQueueScreen';
import EnhancedHomeScreen from '../../Screens/HomeScreen';
import EnhancedLeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedSessionScreen from '../../Screens/SessionScreen';
import EnhancedStatsScreen from '../../Screens/StatsScreen';
import EnhancedSubscribeScreen from '../../Screens/SubscribeScreen';
import FriendsScreen from '../../Screens/FriendsScreen';
import EnhancedBadgesScreen from "../../Screens/BadgesScreen";
import GroupSessionScreen from '../../Screens/GroupSessionScreen';
import SessionTypeScreen from '../../Screens/SessionTypeScreen';
import SettingsScreen from '../../Screens/SettingsScreen';

import {User} from '../../watermelon/models';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();
const Session = createStackNavigator()
interface Props {
  user: User;
  setUser: any;
  hikers: any;
}
export function HomeStack({user, setUser}: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false, headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedHomeScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Achievements"
        options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedAchievementsScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
        <Stack.Screen
            name="Badges"
            options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
            {(props: any) => (
                <EnhancedBadgesScreen {...props} user={user} setUser={setUser} />
            )}
        </Stack.Screen>

      <Stack.Screen name="HikingQueue" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedHikingQueueScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Stats" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedStatsScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="CompletedHikes" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => (
          <EnhancedCompletedHikesScreen
            {...props}
            user={user}
            setUser={setUser}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Leaderboards" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
        {(props: any) => <EnhancedLeaderboardsScreen user={user} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Subscribe" options={{presentation: 'modal', headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <EnhancedSubscribeScreen user={user} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props: any) => <SettingsScreen user={user} {...props} />}
      </Stack.Screen>
        <Stack.Screen name="Shop" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}} >
            {(props: any) => <AddOnStoreScreen user={user} {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
  );
}

export function SessionStack({ user}: Props)
{
  return (
    <Session.Navigator>
      <Session.Screen name="Session Type">
        {(props:any) => <SessionTypeScreen user={user} {...props} />}
      </Session.Screen>
      <Session.Screen name="Group" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props:any) => <GroupSessionScreen user={user} {...props} />}
      </Session.Screen>

      <Session.Screen name="Solo" options={{headerBackButtonDisplayMode: "minimal", headerTitleAlign: "center"}}>
        {(props:any) => <EnhancedSessionScreen user={user} {...props} />}
      </Session.Screen>

    </Session.Navigator>
  )
}

