import {createStackNavigator} from '@react-navigation/stack';
import AchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedHikesScreen from '../../Screens/CompletedHikesScreen';
import FriendsScreen from '../../Screens/FriendsScreen';

import EnhancedHomeScreen from '../../Screens/HomeScreen';
import LeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedStatsScreen from '../../Screens/StatsScreen';
import {User} from '../../watermelon/models';
import EnhancedHikingQueueScreen from '../../Screens/HikingQueueScreen';
import SubscribeScreen from '../../Screens/SubscribeScreen';
import SettingsScreen from '../../Screens/SettingsScreen';
import EnhancedLeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedSubscribeScreen from '../../Screens/SubscribeScreen';
const Stack = createStackNavigator();
interface Props {
  user: User;
  setUser: any;
}
export function HomeStack({user, setUser}: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false}}>
        {(props: any) => (
          <EnhancedHomeScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="HikingQueue">
        {(props: any) => (
          <EnhancedHikingQueueScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Stats">
        {(props: any) => (
          <EnhancedStatsScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="CompletedHikes">
        {(props: any) => (
          <EnhancedCompletedHikesScreen
            {...props}
            user={user}
            setUser={setUser}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Leaderboards">
        {(props: any) => <EnhancedLeaderboardsScreen user={user} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Subscribe" options={{presentation: 'modal'}}>
        {(props: any) => <EnhancedSubscribeScreen user={user} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {(props: any) => <SettingsScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
