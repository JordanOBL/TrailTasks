import { Button, Card, useTheme } from 'react-native-paper';
import { Park_Wild, User } from '../watermelon/models';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { withObservables } from '@nozbe/watermelondb/react';

const LogbookScreen = ({ user, userWilds, completedTrails, parkPasses, navigation }) => {
  const db = useDatabase();
  const theme = useTheme();
  const [parksWildsData, setParksWildsData] = React.useState<Park_Wild[]>([]);
  const [parks, setParks] = React.useState([]);

  React.useEffect(() => {
    const fetchLogbookData = async () => {
      const parksWilds: Park_Wild[] = await db.get('parks_wilds').query().fetch();
      console.log('Fetched Parks Wilds', parksWilds.length);
      const parksData = await db.get('parks').query().fetch();
      console.log('Fetched Parks', parksData.length);
      setParks(parksData);
      setParksWildsData(parksWilds);
    }

    fetchLogbookData();
  }, [db]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Logbook</Text>
      <Pressable style={styles.card} onPress={() => {
        console.log('Navigate to Wilds');
        navigation.navigate('MyWilds', { userWilds });
        }}>
        <Text style={styles.title}>My Wilds</Text>
        <Text style={styles.subtitle}>
          {userWilds ? `${userWilds.length} / 63` : '0'} wilds unlocked
        </Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => {
        console.log('Navigate to Parks');
        navigation.navigate('Parks', {parks, parkPasses, completedTrails, userWilds});

        }}>
        <Text style={styles.title}>Parks</Text>
        <Text style={styles.subtitle}>0 Park Rewards Available</Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(['user'], ({ user }) => ({
  user: user.observe(),
  userWilds: user.usersWilds.observe(),
  completedTrails: user.usersCompletedTrails.observe(),
  parkPasses: user.usersParks.observe(),
}));

const EnhancedLogbookScreen = enhance(LogbookScreen);
export default EnhancedLogbookScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4EF', // soft green-gray background
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3A5A40',
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
