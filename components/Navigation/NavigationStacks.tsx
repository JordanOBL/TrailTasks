import {createStackNavigator} from '@react-navigation/stack';
import AchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedHikesScreen from '../../Screens/CompletedHikesScreen';
import FriendsScreen from '../../Screens/FriendsScreen';
import HikingQueueScreen from '../../Screens/HikingQueueScreen';
import EnhancedHomeScreen from '../../Screens/HomeScreen';
import LeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import EnhancedStatsScreen from '../../Screens/StatsScreen';
import {User} from '../../watermelon/models';
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
      <Stack.Screen name="HikingQueue" component={HikingQueueScreen} />
      <Stack.Screen name="Stats">
        {(props: any) => (
          <EnhancedStatsScreen
            {...props}
            user={user}
            setUser={setUser}
          />
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
        {(props: any) => <LeaderboardsScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
