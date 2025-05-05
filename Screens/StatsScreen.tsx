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
import {useTheme} from '../contexts/ThemeProvider';

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
  const { theme } = useTheme();

  const [sessionCategories, setSessionCategories] = React.useState<Session_Category[]>([]);
  const [userSessionsWithCategories, setUserSessionsWithCategories] = React.useState<any[]>([]);
  const [timeFilter, setTimeFilter] = React.useState<string>('All Time');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All Categories');
  const [filteredUserSessions, setFilteredUserSessions] = React.useState<any[]>([]);
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
        : userSessionsWithCategories.filter((session) => session.sessionCategoryName === categoryName)
    );
  };

  async function getUserSessionsWithCategories() {
    try {
      const query = `
        SELECT users_sessions.*, session_categories.session_category_name 
        FROM users_sessions 
        LEFT JOIN session_categories ON users_sessions.session_category_id = session_categories.id 
        WHERE users_sessions.user_id = ?
        ORDER BY users_sessions.date_added DESC;
      `;
      const sessions: any[] = await watermelonDatabase
        .get('users_sessions')
        .query(Q.unsafeSqlQuery(query, [user.id]))
        .unsafeFetchRaw();
      setUserSessionsWithCategories(sessions);
      setFilteredUserSessions(sessions);
    } catch (err) {
      handleError(err, "Stats Screen getUserSessionsWithCategories");
    }
  }

  async function getSessionCategories() {
    try {
      const categories = await watermelonDatabase.get('session_categories').query().fetch();
      const mapped = categories.map((cat) => ({
        sessionCategoryName: cat.sessionCategoryName,
        sessionCategoryId: cat.id
      }));
      setSessionCategories(mapped);
    } catch (err) {
      handleError(err, "getSessionCategories() in Stats Screen");
    }
  }

  React.useEffect(() => {
    getSessionCategories();
    getUserSessionsWithCategories();
  }, [user]);

  React.useEffect(() => {
    FilterBy(timeFilter, categoryFilter, userSessionsWithCategories, setFilteredUserSessions);
    setShowFilterMenu(false);
  }, [timeFilter, categoryFilter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} testID="stats-screen">
      <Pressable style={styles.filterToggle} onPress={() => setShowFilterMenu(prev => !prev)}>
        <Text style={[styles.filterToggleText, { color: theme.text }]}>Filter</Text>
        <Ionicons name={showFilterMenu ? 'caret-up-outline' : 'caret-down-outline'} size={20} color={theme.secondaryText} />
      </Pressable>

      {showFilterMenu && (
        <View style={[styles.filterMenu, { backgroundColor: theme.card }]}>
          <Dropdown
            data={[{ sessionCategoryName: 'All Categories', sessionCategoryId: 0 }, ...sessionCategories]}
            onChange={(item) => handleCategoryFilterChange(item.sessionCategoryName)}
            labelField="sessionCategoryName"
            valueField="sessionCategoryId"
            placeholder="Select a category"
            style={[styles.dropdown, { backgroundColor: theme.inputBackground, color: theme.text }]}
            placeholderStyle={{ color: theme.secondaryText }}
            selectedTextStyle={{ color: theme.text }}
            value={categoryFilter}
          />

          <Dropdown
            data={timeFrames}
            onChange={(item) => handleTimeFilterChange(item.label)}
            labelField="label"
            valueField="value"
            placeholder="Select a time frame"
            style={[styles.dropdown, { backgroundColor: theme.inputBackground, color: theme.text }]}
            placeholderStyle={{ color: theme.secondaryText }}
            selectedTextStyle={{ color: theme.text }}
            value={timeFilter}
          />

          <Pressable
            style={[styles.filterButton, { backgroundColor: theme.button }]}
            onPress={() => {
              setCategoryFilter('All Categories');
              setTimeFilter('All Time');
              setShowFilterMenu(false);
            }}
          >
            <Text style={{ color: theme.buttonText, fontWeight: '600' }}>Reset</Text>
          </Pressable>
        </View>
      )}

      {view === 'sessions' ? (
        <SessionList filteredUserSessions={filteredUserSessions} sessionCategories={sessionCategories} />
      ) : (
        <Stats
          filteredUserSessions={filteredUserSessions}
          filteredCategory={categoryFilter}
          filteredTime={timeFilter}
          sessionCategories={sessionCategories}
        />
      )}

      <Pressable
        style={[styles.toggleButton, { backgroundColor: theme.button }]}
        testID="toggle-stats-screen"
        onPress={() => setView(view === 'stats' ? 'sessions' : 'stats')}
      >
        <Ionicons
          name={view === 'stats' ? 'list-outline' : 'podium-outline'}
          size={24}
          color={theme.buttonText}
        />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  dropdown: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterToggleText: {
    fontWeight: '600',
    fontSize: 17,
  },
  filterMenu: {
    width: '100%',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  filterButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 6,
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

export default StatsScreen;
