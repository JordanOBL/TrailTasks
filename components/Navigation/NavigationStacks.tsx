import { createStackNavigator } from '@react-navigation/stack';
import AchievementsScreen from '../../Screens/AchievementsScreen';
import CompletedHikesScreen from '../../Screens/CompletedHikesScreen';
import FriendsScreen from '../../Screens/FriendsScreen';
import HikingQueueScreen from '../../Screens/HikingQueueScreen';
import HomeScreen from '../../Screens/HomeScreen';
import LeaderboardsScreen from '../../Screens/LeaderboardsScreen';
import StatsScreen from '../../Screens/StatsScreen';
const Stack = createStackNavigator();
export function HomeStack({ route }: any)
{
  const { setUser } = route.params
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
        initialParams = {{setUser}}
      />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="HikingQueue" component={HikingQueueScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="CompletedHikes" component={CompletedHikesScreen} />
      <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
    </Stack.Navigator>
  );
}
