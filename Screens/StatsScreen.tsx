import * as React from 'react';

import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Session_Category, User, User_Session} from '../watermelon/models';

import {FilterBy} from '../helpers/Stats/FilterFunction';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Q} from '@nozbe/watermelondb';
import { Dropdown } from 'react-native-element-dropdown';
import SessionList from '../components/Stats/SessionList';
import Stats from '../components/Stats/Stats';
import handleError from "../helpers/ErrorHandler";
import {useDatabase} from '@nozbe/watermelondb/react';

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

type Props = {
  user: User;
  userSessions: User_Session[];
};

const StatsScreen: React.FC<Props> = ({user, userSessions}) => {
  const watermelonDatabase = useDatabase();

  const [sessionCategories, setSessionCategories] = React.useState<
    Session_Category[] | []
  >([]);
  const [userSessionsWithCategories, setUserSessionsWithCategories] =
    React.useState<Session_Category[] | []>([]);
  const [timeFilter, setTimeFilter] = React.useState<string>(
    timeFrames[0].label
  );
  const [categoryFilter, setCategoryFilter] =
    React.useState<string>('All Categories');
  const [filteredUserSessions, setFilteredUserSessions] = React.useState<any[]>(
    userSessionsWithCategories
  );
  const [view, setView] = React.useState<'stats' | 'sessions'>('stats');
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  const handleTimeFilterChange = (str: string) => {
    setTimeFilter(str);
  };

  const handleCategoryFilterChange = (categoryName: string) => {
    console.log(categoryName);
    setCategoryFilter(categoryName);
    setFilteredUserSessions( prev => {
      if (categoryName === 'All Categories') {
        return userSessionsWithCategories
      } else {
        return userSessionsWithCategories.filter(
          (session) => session.sessionCategoryName === categoryName
        )
      }
    })
  };

  async function getUserSessionsWithCategories() {
    try {
      const query = `SELECT users_sessions.*, session_categories.session_category_name 
      FROM users_sessions 
      LEFT JOIN session_categories ON users_sessions.session_category_id = session_categories.id 
      WHERE users_sessions.user_id = ?
      ORDER BY users_sessions.date_added DESC;`;
      const userSessionsWithCategories: any[] = await watermelonDatabase
        .get('users_sessions')
        .query(Q.unsafeSqlQuery(query, [user.id]))
        .unsafeFetchRaw();
      if (userSessionsWithCategories) {
        setUserSessionsWithCategories(userSessionsWithCategories);
        setFilteredUserSessions(userSessionsWithCategories);
      }
    } catch (err) {
      handleError(err, "Stats Screen getUserSessionsWithCategories");
    }
  }

  async function getSessionCategories() {
    try {
      const sessionCategories = (await watermelonDatabase
        .get('session_categories')
        .query()
        .fetch()) as Session_Category[];
      if (sessionCategories) {
        const sessionCategoriesWithId = sessionCategories.map((category) => {
        return {
            sessionCategoryName: category.sessionCategoryName, 
            sessionCategoryId: category.id
          }
        });
        setSessionCategories(sessionCategoriesWithId);
      }
    } catch (err) {
      handleError(err, "getSessionCategories() in Stats Screen");
    }
  }

  React.useEffect(() => {
    getSessionCategories();
    getUserSessionsWithCategories();

    return () => {};
  }, [user]);

  React.useEffect(() => {
    FilterBy(timeFilter, categoryFilter, userSessionsWithCategories, setFilteredUserSessions);
    setShowFilterMenu(false)
  }, [timeFilter, categoryFilter]);


  return (
    <SafeAreaView style={styles.container} testID="stats-screen">
      {/* Filter Toggle */}
      <Pressable
        style={styles.filterToggle}
        onPress={() => setShowFilterMenu((prev) => !prev)}>
        <Text style={styles.filterToggleText}>Filter</Text>
        <Ionicons
          name={showFilterMenu ? 'caret-up-outline' : 'caret-down-outline'}
          size={20}
          color="rgba(221, 224, 226, 0.5)"
        />
      </Pressable>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={styles.filterMenu}>
          {/* Category Filter Dropdown */}
          { categoryFilter === 'All Categories' ? <Dropdown
            data={[
              {sessionCategoryName: 'All Categories', sessionCategoryId: 0},
              ...sessionCategories,
            ]}
            onChange={(selectedItem) =>
              handleCategoryFilterChange(selectedItem.sessionCategoryName)
            }
            testID="session-category-dropdown"
            itemTestIDField="category-dropdown-selection"
            style={styles.dropdown}
            labelField="sessionCategoryName"
            valueField="sessionCategoryId"
            placeholder="Select a category"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            value={categoryFilter}
          /> : <Text style={styles.selectedTextStyle}>{categoryFilter}</Text> }

          {/* Time Filter Dropdown */}
          {timeFilter === 'All Time' ? <Dropdown
            style={styles.dropdown}
            data={timeFrames}
            onChange={(selectedItem) =>
              handleTimeFilterChange(selectedItem.label)
            }
            labelField="label"
            valueField="value"
            placeholder="Select a time frame"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            value={timeFilter}

          /> : <Text style={styles.selectedTextStyle}>{timeFilter}</Text> }

          {/* Filter Button */}
          <Pressable
            style={[styles.filterButton, styles.filterApplyButton]}
            onPress={() =>{
              setCategoryFilter('All Categories')
              setTimeFilter('All Time')
          
              setShowFilterMenu(false)
            }
            }>
            <Text style={styles.filterApplyButtonText}>Reset</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      {view === 'sessions' ? (
        <SessionList
          filteredUserSessions={filteredUserSessions}
          sessionCategories={sessionCategories}
        />
      ) : (
        <Stats
          filteredUserSessions={filteredUserSessions}
          filteredCategory={categoryFilter}
          filteredTime={timeFilter}
          sessionCategories={sessionCategories}
        />
      )}

      {/* Screen View Toggle */}
      <Pressable
        style={styles.toggleButton}
        testID="toggle-stats-screen"
        onPress={() => setView(view === 'stats' ? 'sessions' : 'stats')}>
        <Ionicons
          name={view === 'stats' ? 'list-outline' : 'podium-outline'}
          size={24}
          color="rgb(18, 19, 21)"
        />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(18, 19, 21)',
  },
  dropdown: {
    backgroundColor: 'rgb(31, 33, 35)',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    color: 'rgb(221, 224, 226)',
  },
 filterToggle: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#1C1C1E',
  borderBottomColor: '#2C2C2E',
  borderBottomWidth: 1,
},
filterToggleText: {
  color: '#D1D1D6',
  fontWeight: '600',
  fontSize: 17,
},
filterMenu: {
  width: '100%',
  backgroundColor: '#1C1C1E',
  padding: 16,
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 3,
},
filterButton: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginVertical: 6,
},
filterApplyButton: {
  backgroundColor: '#0A84FF', // iOS blue
  alignItems: 'center',
},
filterApplyButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
},
selectedTextStyle: {
  fontSize: 16,
  fontWeight: '500',
  color: '#0A84FF',
  paddingVertical: 4,
},
placeholderStyle: {
  color: '#8E8E93',
},
toggleButton: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: '#0A84FF',
  borderRadius: 28,
  width: 56,
  height: 56,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
});

export default StatsScreen;
