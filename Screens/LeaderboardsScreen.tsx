import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { User } from '../watermelon/models';

import EnhancedLeaderboard from '../components/Leaderboards/Leaderboard';
import SyncIndicator from '../components/SyncIndicator';
import { sync } from '../watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import {withObservables} from '@nozbe/watermelondb/react'
import { useInternetConnection } from "../hooks/useInternetConnection";
import RefreshConnection from "../components/RefreshConnection";
import handleError from "../helpers/ErrorHandler";

import FetchGlobalLeaderboards, {Leaderboard} from "../components/Leaderboards/FetchGlobalLeaderboards";
import FilterSearch from "../components/FilterSearch";

interface Props {
  user: User;
}

const LeaderboardsScreen = ({ user }: Props) => {
  const watermelonDatabase = useDatabase();
  const {isConnected, refreshConnectionStatus} = useInternetConnection();
  const [filter, setFilter] = useState('Top 100');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Custom hook to fetch leaderboards, only if user is defined
  const { leaderboard, loading, error } = FetchGlobalLeaderboards(user.id);

  // Changes the value of filter state
  const selectFilter = (value: string) => {
    setFilter(value);
    setShowDropdown(false);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await sync(watermelonDatabase, isConnected, user.id);
    }, 300000); // Sync every ~5min

    return () => clearInterval(interval);
  }, [watermelonDatabase, user.id]);

  // Show or hide filter dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Filter the leaderboard based on filter and search query
  const filteredLeaderboard:any = useMemo(() => {
    let filtered = leaderboard || [];

    if (filter === 'Top 100') {
      filtered = leaderboard || [];
    }
    // Uncomment and implement when needed
    // else if (filter === 'Friends') {
    //   filtered = leaderboard?.friendsRankings || [];
    // }

    // }

    return filtered;
  }, [filter, searchQuery, leaderboard]);

  if (!isConnected) {
    return (
        // @ts-ignore
        <RefreshConnection>
          {`Internet Connection is Needed to view Leaderboard\nTry Refreshing Connection`}
        </RefreshConnection>
    );
  }

  if (loading) {
    return (
        <View>
          <Text>Loading...</Text>
        </View>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <SyncIndicator database={watermelonDatabase} delay={3000} />
        <FilterSearch
            showSearch={false}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectFilter={selectFilter}
            filterParams={["Top 100", "Friends"]}
            filter={filter}
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            bgColor={'black'}
        />
        <EnhancedLeaderboard
            leaderboard={filteredLeaderboard}
            user={user}
        />
      </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({ user }) => ({
  user,
}));

const EnhancedLeaderboardsScreen = enhance(LeaderboardsScreen);
export default EnhancedLeaderboardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
