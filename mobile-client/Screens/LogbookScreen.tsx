import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Park, Park_Wild, Trail, User, User_Wild } from '../watermelon/models';
import React, { useCallback } from 'react';
import { darkTheme, lightTheme } from '../theme';

import { Model } from '@nozbe/watermelondb';
import { useAuthContext } from '../services/AuthContext';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeProvider';
import { withObservables } from '@nozbe/watermelondb/react';

interface Props {
  navigation: any;
}
type theme = typeof lightTheme | typeof darkTheme;


const LogbookScreen = ({  navigation } : Props) => {
  const {user} = useAuthContext();
  const db = useDatabase();

  const [parksCount, setParksCount] = React.useState<Park[]>([]);
  const [userWildsCount, setUserWildsCount] = React.useState<number | null>(null);
const {theme} = useTheme()
const styles = getStyles(theme)
const load = useCallback(async() => {
  const [parksCount, parksWilds, userWildCount] = await Promise.all([
    db.get<Park>('parks').query().fetch(),
    db.get<Park_Wild>('parks_wilds').query().fetchCount(),
    db.get<User_Wild>('users_wilds').query().fetchCount(),
  ]); 
  setParksCount(parksCount);
  setUserWildsCount(userWildCount);
}, [db])
useFocusEffect(useCallback(() => {
  load();
}, [load]))

if (!user || userWildsCount === null || parksCount === null) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Logbook</Text>
      <Pressable style={styles.card} onPress={() => {
        console.log('Navigate to Wilds');
        navigation.navigate('MyWilds');
        }}>
        <Text style={styles.title}>My Wilds</Text>
        <Text style={styles.subtitle}>
          {userWildsCount ? `${userWildsCount} / 63` : '0'} wilds unlocked
        </Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => {
        console.log('Navigate to Parks');
        navigation.navigate('Parks');
        }}>
        <Text style={styles.title}>Parks</Text>
        <Text style={styles.subtitle}>0 Park Rewards Available</Text>
      </Pressable>
    </View>
  );
};

// const enhance = withObservables(['user'], ({ user }) => ({
//   user: user.observe(),
//   userWilds: user.usersWilds.observe(),
//   completedTrails: user.usersCompletedTrails.observe(),
//   parkPasses: user.usersParks.observe(),
// }));

// const EnhancedLogbookScreen = enhance(LogbookScreen);
export default LogbookScreen;

const getStyles = (theme: theme)=> {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:theme.background, // soft green-gray background
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
});
};
