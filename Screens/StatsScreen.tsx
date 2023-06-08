import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {RadioButton, SegmentedButtons} from 'react-native-paper';
import * as React from 'react';

import SelectDropdown from 'react-native-select-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import SessionList from '../components/Stats/SessionList';
import Stats from '../components/Stats/Stats';
import {FilterBy} from '../helpers/Stats/FilterFunction';
import {User, User_Session} from '../watermelon/models';
import withObservables from '@nozbe/with-observables';

type TimeFrame = {
  label: string;
  value: number;
};
const timeFrames: TimeFrame[] = [
  {label: 'All Time', value: 0},
  {label: '1 Year', value: 365},
  {label: '6 Months', value: 180},
  {label: '3 Months', value: 90},
  {label: '1 Month', value: 30},
  {label: '2 Weeks', value: 14},
  {label: '1 Week', value: 7},
  {label: '1 Day', value: 1},
];
const categories: string[] = [
  'All Categories',
'Chores',
'Cooking',
'Drawing',
'Driving',
'Errands',
'Family',
'Meditating',
'Other',
'Outdoors',
'Pets',
'Reading',
'Social',
'Sports',
'Study',
'Work',
'Workout',
'Writing',
'Yoga',
];

type Props = {
  user: User;
  userSessions: User_Session[];
};

const StatsScreen: React.FC<Props> = ({user, userSessions}) => {
  const watermelonDatabase = useDatabase();
  // const [usersSessionsCollection, setUsersSessionsCollection] = React.useState<any>()
  // const getUsersSession = async () =>
  // {
  //   const usersSessionsCollection = await watermelonDatabase.collections.get('users_sessions').query().fetch()
  //   setUsersSessionsCollection(usersSessionsCollection)
  // }

 
  const [timeFilter, setTimeFilter] = React.useState<string>(
    timeFrames[0].label
  );
  const [categoryFilter, setCategoryFilter] = React.useState<string>(
    categories[0]
  );
  // const [userSessions, setUserSessions] = React.useState<any[]>([]);
  const [filteredUserSessions, setFilteredUserSessions] = React.useState<
    User_Session[]
  >(userSessions);

  const [view, setView] = React.useState('stats');
  const [showFilterMenu, setShowFIlterMenu] = React.useState(false);

  function pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  // function formatTime(seconds: number): string {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  // }

  const handleTimeFilterChange = (str: string) => {
    setTimeFilter(str);
  };

  const handleCategoryFilterChange = (str: string) => {
    setCategoryFilter(str);
  };

console.log(userSessions)
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: 10,
          backgroundColor: 'rgba(0,200,250, 1)',
        }}
        onPress={() => setShowFIlterMenu((prev) => !prev)}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 22,
          }}>
          Filter Menu
        </Text>
        {showFilterMenu ? (
          <Ionicons name="caret-down-outline" size={20} color="white" />
        ) : (
          <Ionicons size={20} name="caret-forward-outline" color="white" />
        )}
      </Pressable>
      {showFilterMenu ? (
        <View
          style={{
            backgroundColor: 'rgba(50, 50, 50, 1)',
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            top: 45,
            padding: 20,
          }}>
          <View style={styles.filterContainer}>
            <SelectDropdown
              data={categories}
              onSelect={(item) => handleCategoryFilterChange(item)}
              defaultButtonText={categoryFilter}
              buttonStyle={styles.filterButton}
              buttonTextStyle={styles.filterButtonText}
              dropdownStyle={styles.filterDropdown}
              //dropdownTextStyle={styles.filterDropdownText}
            />

            <SelectDropdown
              data={timeFrames}
              onSelect={(selectedItem, index) =>
                handleTimeFilterChange(selectedItem.label)
              }
              buttonTextAfterSelection={(selectedItem, index) => {
                // text represented after item is selected
                // if data array is an array of objects then return selectedItem.property to render after item is selected
                return selectedItem.label;
              }}
              rowTextForSelection={(item, index) => {
                // text represented for each item in dropdown
                // if data array is an array of objects then return item.property to represent item in dropdown
                return item.label;
              }}
              defaultButtonText={timeFilter}
              buttonStyle={styles.filterButton}
              buttonTextStyle={styles.filterButtonText}
              dropdownStyle={styles.filterDropdown}

              //dropdownTextStyle={styles.filterDropdownText}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <Pressable
              style={{
                backgroundColor: 'rgba(0,200,250, 1)',
                padding: 10,
                width: '90%',
                borderRadius: 10,
              }}
              onPress={() =>
                FilterBy(
                  timeFilter,
                  categoryFilter,
                  userSessions,
                  setFilteredUserSessions
                )
              }>
              <Text
                style={{
                  color: 'black',
                  textAlign: 'center',
                  padding: 5,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                Filter
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View></View>
      )}
      {view === 'sessions' ? (
        <SessionList filteredUserSessions={filteredUserSessions} sessionCategories={categories} />
      ) : (
        <Stats
          filteredUserSessions={filteredUserSessions}
          filteredCategory={categoryFilter}
            filteredTime={timeFilter}
            sessionCategories={categories}
        />
      )}
      <SegmentedButtons
        style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          position: 'absolute',
          bottom: 10,
        }}
        value={view}
        onValueChange={setView}
        buttons={[
          {
            value: 'stats',
            label: 'Stats',
            icon: 'information',
            style: {backgroundColor: 'white'},
          },
          {
            value: 'sessions',
            label: 'Sessions',
            icon: 'format-list-bulleted-square',
            style: {backgroundColor: 'white'},
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: '100%',
  },
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
});
const enhance = withObservables(['user', 'userSessions'], ({user}) => ({
  user: user.observe(),
  userSessions: user.usersSessions.observe(),
  userSessionsWithCategory: user.userSessionsWithCategory.observe()
  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedStatsScreen = enhance(StatsScreen);
export default EnhancedStatsScreen;

