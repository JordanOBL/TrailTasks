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
import SelectDropdown from 'react-native-select-dropdown';
import SessionList from '../components/Stats/SessionList';
import Stats from '../components/Stats/Stats';
import handleError from "../helpers/ErrorHandler";
import {useDatabase} from '@nozbe/watermelondb/hooks';

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
    setCategoryFilter(categoryName);
    setFilteredUserSessions(
      categoryName === 'All Categories'
        ? userSessionsWithCategories
        : userSessionsWithCategories.filter(
            (session) => session.sessionCategoryName === categoryName
          )
    );
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
        setSessionCategories(sessionCategories);
      }
    } catch (err) {
      handleError(err, "getSessionCategories() in Stats Screen");
    }
  }

  React.useEffect(() => {
    getSessionCategories();
    getUserSessionsWithCategories();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Toggle */}
      <Pressable
        style={styles.filterToggle}
        onPress={() => setShowFilterMenu((prev) => !prev)}>
        <Text style={styles.filterToggleText}>Filter</Text>
        <Ionicons
          name={showFilterMenu ? 'caret-up-outline' : 'caret-down-outline'}
          size={20}
          color="rgb(221, 224, 226)"
        />
      </Pressable>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={styles.filterMenu}>
          {/* Category Filter Dropdown */}
          <SelectDropdown
            data={[
              {sessionCategoryName: 'All Categories'},
              ...sessionCategories,
            ]}
            onSelect={(selectedItem) =>
              handleCategoryFilterChange(selectedItem.sessionCategoryName)
            }
            buttonTextAfterSelection={(selectedItem) =>
              selectedItem.sessionCategoryName
            }
            rowTextStyle={styles.filterRowText}
            rowTextForSelection={(item) => item.sessionCategoryName}
            defaultButtonText={categoryFilter}
            buttonStyle={styles.filterButton}
            buttonTextStyle={styles.filterButtonText}
            dropdownStyle={styles.filterDropdown}
          />

          {/* Time Filter Dropdown */}
          <SelectDropdown
            data={timeFrames}
            onSelect={(selectedItem) =>
              handleTimeFilterChange(selectedItem.label)
            }
            buttonTextAfterSelection={(selectedItem) => selectedItem.label}
            rowTextStyle={styles.filterRowText}
            rowTextForSelection={(item) => item.label}
            defaultButtonText={timeFilter}
            buttonStyle={styles.filterButton}
            buttonTextStyle={styles.filterButtonText}
            dropdownStyle={styles.filterDropdown}
          />

          {/* Filter Button */}
          <Pressable
            style={[styles.filterButton, styles.filterApplyButton]}
            onPress={() =>
              FilterBy(
                timeFilter,
                categoryFilter,
                userSessionsWithCategories,
                setFilteredUserSessions
              )
            }>
            <Text style={styles.filterApplyButtonText}>Apply</Text>
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
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgb(7, 254, 213)',
  },
  filterToggleText: {
    color: 'rgb(18, 19, 21)',
    fontWeight: 'bold',
    fontSize: 18,
  },
  filterMenu: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgb(18, 19, 21)',
    borderRadius: 10,
    elevation: 5,
    padding: 20,
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: 'rgb(31, 33, 35)',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(221, 224, 226)',
  },
  filterDropdown: {
    backgroundColor: 'rgb(31, 33, 35)',
    borderRadius: 5,
    borderWidth: 0,
    borderColor: 'rgb(221, 224, 226)',
    marginTop: 5,
  },
  filterRowText: {
    color: 'rgb(221, 224, 226)',
  },
  filterApplyButton: {
    backgroundColor: 'rgb(7, 254, 213)',
    alignItems: 'center',
  },
  filterApplyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(18, 19, 21)',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgb(7, 254, 213)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

export default StatsScreen;
