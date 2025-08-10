import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Rive, { RiveRef }  from 'rive-react-native';

import React from 'react';
import ScreenLink from '../components/HomeScreen/screenLink';
import {User} from '../watermelon/models';
import WildAvatar from '../components/Wilds/WildAvatar';
import {useAuthContext} from '../services/AuthContext';

interface Props {
  user: User;
  currentWild: string;
  navigation: any;
  setUser: any;
}

const SessionTypeScreen = ({navigation, user, setUser}: Props) => {
  const {isProMember} = useAuthContext();
  const [selection, setSelection] = React.useState('solo');
  const currentWild = 'scout';

   const riveRef = React.useRef<RiveRef>(null);

  function blink()
  {
     riveRef.current?.fireState('State Machine 1', 'blink');

  }
function getRandom() {
  return Math.floor(Math.random() * 3000) + 5000; // Between 2s–5s
}

React.useEffect(() => {
  let timeout = null;

  function scheduleBlink() {
    const delay = getRandom();
    timeout = setTimeout(() => {
      if (riveRef.current) blink();
      scheduleBlink(); // Recurse to schedule the next blink
    }, delay);
  }

  scheduleBlink(); // Start the blinking loop

  return () => {
    clearTimeout(timeout); // Clean up on unmount
  };
}, [riveRef]);

  async function toggleSwitch() {
    setSelection(previousState =>
      previousState === 'solo' ? 'group' : 'solo',
    );
  }
  async function handleSelection() {
    if (isProMember) {
      if (selection === 'solo') {
        navigation.navigate('Solo', {user});
      } else {
        navigation.navigate('Group', {user});
      }
    } else {
      if (selection === 'solo') {
        navigation.navigate('Solo');
      } else {
        navigation.navigate('Basecamp', {screen: 'Subscribe'});
      }
    }
  }
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={{width: '100%', alignItems: 'center'}}>
          {selection === 'solo' ? (
            /* <WildAvatar id={currentWild} pose="wave" size={200} />*/
            <Rive
              ref={riveRef}
     resourceName={currentWild}
      artboardName="Artboard"
      stateMachineName="State Machine 1"
      style={{width: 250, height: 250}}
  />
          ) : (
            <View style={styles.groupWildsContainer}>
              <WildAvatar key={0} id={'ember'} pose="wave" size={200} />
              <WildAvatar key={2} id={'buckey'} pose="wave" size={200} />
              <WildAvatar id={'scout'} pose="wave" size={200} />
            </View>
          )}
        </View>
        <View style={styles.switchContainer}>
          <Text
            style={[
              styles.switchLabel,
              {color: selection === 'solo' ? 'rgb(7,254,213)' : 'white'},
            ]}>
            Solo
          </Text>
          <Switch
            trackColor={{false: 'white', true: 'white'}}
            thumbColor={'rgb(7,254,213)'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={!(selection === 'solo')}
          />
          <Text
            style={[
              styles.switchLabel,
              {color: selection === 'group' ? 'rgb(7,254,213) ' : 'white'},
            ]}>
            Group
          </Text>
        </View>
      </View>
      <Pressable onPress={handleSelection} style={styles.goButton}>
        <Text style={styles.goButtonText}>GO!</Text>
      </Pressable>
    </View>
  );
};

export default SessionTypeScreen;

const styles = StyleSheet.create({
  goButton: {
    marginTop: 10,
    backgroundColor: 'rgb(7,254,213)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '75%',
  },

  goButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  groupWildsContainer: {
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'center',
    alignItems:'center',
  },
  switchContainer: {
    flexDirection: 'row',
    width: '50%',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical:20,
  },
  switchLabel: {
    fontWeight: 'bold',
    fontSize: 24,
  },
});
