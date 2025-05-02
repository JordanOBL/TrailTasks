import * as React from 'react';

import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {Session_Category} from '../../watermelon/models';
import formatTime from '../../helpers/formatTime';
import {getSessionStats} from '../../helpers/Stats/GetSessionStats';

type Props = {
  filteredUserSessions: any[];
  filteredCategory: string;
  filteredTime: string;
  sessionCategories: Session_Category[];
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
    <View style={styles.container} testID="stats-container">
      <View style={styles.header}>
        <Text style={styles.headerText}>Stats for: "{filteredCategory}"</Text>
        <Text style={styles.headerText}>Period: "{filteredTime}"</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <Text style={styles.statTitle}>Total Focus Time</Text>
          <Text testID="total-focus-time" style={styles.statValue}>{formatTime(totalTime)}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statTitle}>Total Distance Hiked</Text>
          <Text testID="total-distance" style={styles.statValue}>{totalDistance.toFixed(2)} miles</Text>
        </View>
        {filteredCategory === 'All Categories' && (
          <View style={styles.statsContainer}>
            <Text style={styles.statTitle}>Most Used Category</Text>
            <Text testID="most-used-category" style={styles.statValue}>{mostUsedCategory}</Text>
          </View>
        )}
        {filteredCategory === 'All Categories' && (
          <View style={styles.statsContainer}>
            <Text style={styles.statTitle}>Most Productive Time</Text>
            <Text testID="most-productive-time" style={styles.statValue}>{mostProductiveTimes[0]}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(18, 19, 21)',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgb(31, 33, 35)',
  },
  headerText: {
    color: 'rgb(7, 254, 213)',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 4,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 16,
    backgroundColor: 'rgb(31, 33, 35)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statTitle: {
    color: 'rgba(221, 224, 226, 0.8)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: 'rgb(221, 224, 226)',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
export default Stats;
