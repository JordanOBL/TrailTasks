import {createStackNavigator} from '@react-navigation/stack';
import AchievementsScreen from '../../Screens/AchievementsScreen';
import EnhancedCompletedHikesScreen from '../../Screens/CompletedHikesScreen';
import FriendsScreen from '../../Screens/FriendsScreen';
import HikingQueueScreen from '../../Screens/HikingQueueScreen';
import EnhancedHomeScreen from '../../Screens/HomeScreen';
import LeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import StatsScreen from '../../Screens/StatsScreen';
import {User} from '../../watermelon/models';
const Stack = createStackNavigator();
interface Props {
  user: User;
  setUser: any;
}
export function HomeStack({user, setUser}: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" options={{headerShown: false}}>
        {(props: any) => (
          <EnhancedHomeScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="HikingQueue" component={HikingQueueScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="CompletedHikes" options={{headerShown: false}}>
        {(props: any) => (
          <EnhancedCompletedHikesScreen {...props} user={user} setUser={setUser} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Leaderboards">
        {(props: any) => (
          <LeaderboardsScreen {...props}  />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
