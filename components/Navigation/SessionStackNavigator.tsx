import EnhancedSessionScreen from '../../Screens/SessionScreen';
import GroupSessionScreen from '../../Screens/GroupSessionScreen';
import SessionTypeScreen from '../../Screens/SessionTypeScreen';
import {User} from '../../watermelon/models';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuthContext} from '../../services/AuthContext';
const Session = createStackNavigator()

export function SessionStackNavigator()
{
    const {user} = useAuthContext()
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

