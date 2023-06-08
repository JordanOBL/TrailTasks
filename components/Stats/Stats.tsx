import {StyleSheet, Text, View, ScrollView} from 'react-native';

import * as React from 'react';
import formatTime from '../../helpers/formatTime';
import {getSessionStats} from '../../helpers/Stats/GetSessionStats';

type Props = {
  filteredUserSessions: any[];
  filteredCategory: string;
  filteredTime: string;
  sessionCategories: string[];
};

const Stats: React.FC<Props> = ({
  filteredUserSessions,
  filteredCategory,
  filteredTime,
  sessionCategories,
}) => {
  const [totalTime, setTotalTime] = React.useState<number>(0);
  const [totalDistance, setTotalDistance] = React.useState<number>(0.0);
  const [mostProductiveTimes, setMostProductiveTimes] = React.useState<
    string[]
  >([]);
  const [mostUsedCategory, setMostUsedCategory] = React.useState<string>('');
  const [leastUsedCategory, setLeastUsedCategory] = React.useState<string>('');
  const [mostProductiveCategory, setMostProductiveCategory] =
    React.useState<string>('');

  React.useEffect(() => {
    getSessionStats(
      filteredUserSessions,
      setTotalTime,
      setTotalDistance,
      setMostProductiveTimes,
      setMostUsedCategory,
      setLeastUsedCategory
    );
  }, [filteredUserSessions]);

  return (
    <View>
      <View style={{padding: 20}}>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 10,
          }}>
          Showing stats for "{filteredCategory}"
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          over a period of "{filteredTime}"
        </Text>
      </View>
      {/* totalTime, totalDistance, mostProductiveTime, mostUsedCategory,
			leastUsedCategory, */}
      <ScrollView style={{height: 550, padding: 20}}>
        <View style={styles.statsContainer}>
          <Text style={styles.statTextTitle}>Total Focus / Hiking Time:</Text>
          <Text style={styles.statText}>{formatTime(totalTime)}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statTextTitle}>Total Hiking Distance:</Text>
          <Text style={styles.statText}>{totalDistance} miles</Text>
        </View>
        {filteredCategory === 'All Categories' ? (
          <View>
            <View style={styles.statsContainer}>
              <Text style={styles.statTextTitle}>Most Used Category:</Text>
              <Text style={styles.statText}>
                {sessionCategories[Number(mostUsedCategory)]}
              </Text>
            </View>
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5,
    paddingRight: 20,
    padding: 10,
  },
  filterButton: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginRight: 10,
    width: '45%',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  listItem: {
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 100, 0, .3)',
    padding: 20,
  },
  statsContainer: {
    marginBottom: 20,
    borderColor: 'white',
    borderWidth: 0,
    height: 100,
    backgroundColor: '#333',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 10
  },
  statTextTitle: {
    color: 'rgba(255, 255, 255, .7)',
    fontSize: 24,
    fontWeight: '500',
    margin: 5,
  },
  statText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    margin: 5,
  },
});

export default Stats;
