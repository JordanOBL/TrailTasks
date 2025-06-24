import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Session_Category } from '../../watermelon/models';
import formatTime from '../../helpers/formatTime';
import { getSessionStats } from '../../helpers/Stats/GetSessionStats';
import { useTheme } from '../../contexts/ThemeProvider';
import { useAuthContext } from '../../services/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const { theme } = useTheme();
  const {isProMember} = useAuthContext();
  const styles = getStyles(theme);

  const [totalTime, setTotalTime] = React.useState<number>(0);
  const [totalDistance, setTotalDistance] = React.useState<number>(0.0);
  const [mostProductiveTimes, setMostProductiveTimes] = React.useState<string[]>([]);
  const [mostUsedCategory, setMostUsedCategory] = React.useState<string>('');
  const [leastUsedCategory, setLeastUsedCategory] = React.useState<string>('');
  const [mostProductiveCategory, setMostProductiveCategory] = React.useState<string>('');

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
          <Text testID="total-focus-time" style={styles.statValue}>
            {totalTime === 0 ? 'N/A' : formatTime(totalTime)}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statTitle}>Total Distance Hiked</Text>
          <Text testID="total-distance" style={styles.statValue}>
            {totalDistance.toFixed(2)} miles
          </Text>
        </View>
        {filteredCategory === 'All Categories' && mostUsedCategory && (
          <View style={styles.statsContainer}>
            <Text style={styles.statTitle}>Most Used Category</Text>
            <Text testID="most-used-category" style={ isProMember ? styles.statValue : [styles.statValue, {opacity: .5}]}>
              {isProMember ? mostUsedCategory : <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}><Icon name="lock-closed" size={18} color={theme.linkDisabled} /><Text style={[styles.statValue, {opacity: .5, marginLeft: 4}]}>Pro</Text></View>}
            </Text>
          </View>
        )}

        {filteredCategory === 'All Categories' && mostProductiveTimes.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statTitle}>Most Productive Time</Text>
             <Text testID="most-productive-time" style={ isProMember ? styles.statValue : [styles.statValue, {opacity: .5}]}>
              {isProMember ? mostUsedCategory : <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}><Icon name="lock-closed" size={18} color={theme.linkDisabled} /><Text style={[styles.statValue, {opacity: .5, marginLeft: 4}]}>Pro</Text></View>}
            </Text>
          </View>
        )}     
      </ScrollView>
    </View>
  );
};

export default Stats;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    headerText: {
      color: theme.button,
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
      backgroundColor: theme.card,
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
      color: theme.secondaryText,
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 8,
    },
    statValue: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

