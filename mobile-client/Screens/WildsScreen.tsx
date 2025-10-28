import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { User_Wild, Wild } from '../watermelon/models';
import { darkTheme, lightTheme } from '../theme';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';

import { Q } from '@nozbe/watermelondb';
import WildCard from '../components/Wilds/WildCard'; // adjust path
import { useAuthContext } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeProvider';

const  WildsScreen = () => {

  const {user} = useAuthContext();
  const {theme} = useTheme();
  const db = useDatabase();
  const styles = getStyles(theme);

  const [userWilds, setUserWilds] = React.useState<User_Wild[]>([]);
  const [wilds, setWilds] = React.useState<Wild[]>([]);

  const load = useCallback(async () => {
    if(!user) return;
    const [userWilds, wilds] = await Promise.all([
      user.usersWilds,
      db.get<Wild>('wilds').query().fetch(),
    ]);
    setWilds(wilds);
    setUserWilds(userWilds);
  }, [user]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]))
    
  console.log('WildsScreen userWilds:', userWilds);
  // const handlePress = useCallback((id: string) => {
  //   Alert.alert('Wild selected', `Open details for ${id}`);
  //   //navigation.navigate('WildDetail', { id });
  // }, []);

  // const createHiddenText = React.useCallback((text: string) => {
  //   return Array.from(text)
  //     .map(_ => '?')
  //     .join('');
  // }, []);

    const switchActiveWild = useCallback(
      async (newActiveWild: User_Wild): Promise<void> => {
        if (!user || !newActiveWild) return;
        if (newActiveWild.isActive) {
          //riveRef.current?.fireState("State Machine 1", "rest");
          const [currentActiveWild] = await user?.usersWilds
            .extend(Q.where("is_active", true))
            .fetch();
          await db.write(async () => {
            await db.batch([
              newActiveWild.update((w: User_Wild) => {
                w.isActive = true;
              }),
              currentActiveWild.update((w: User_Wild) => {
                w.isActive = false;
              }),
            ]);
          });
        }
      },
      [user],
    );

  const rItem = React.useCallback(({ item }: {item: User_Wild}) =>
  {
    return (
   <View style={{margin: 10}}>
     <WildCard
       wild={item}
       switchActiveWild={switchActiveWild}
     />
   </View>)
  }, [user])


  if (!userWilds || userWilds.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white'}}>No Wilds Found</Text>
        <Text style={{color: 'white'}}>Complete All Trails in a Park To Unlock a Wild</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={userWilds}
      keyExtractor={item => item.id}
      numColumns={2} // 2-column card grid
      renderItem={rItem}
    />
  );
}

const enhance = withObservables(['user'], ({user}) => ({
    user: user.observe(),
    usersWilds: user.usersWilds.observe(),
}));

const EnhancedWildsScreen = enhance(WildsScreen);
export default EnhancedWildsScreen;


const  getStyles = (theme: typeof lightTheme | typeof darkTheme) => { 
return StyleSheet.create({
  container: {
        padding: 16,
        margin: 0,
        alignItems: 'center',
  },
})}
