import React, { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
} from 'react-native';
import {withObservables}from "@nozbe/watermelondb/react";
import { User_Completed_Trail, User_Queued_Trail, User, User_Purchased_Trail } from "../watermelon/models";
import EnhancedTrailCard from './Trails/TrailCard';
import FullTrailDetails from "../types/fullTrailDetails";
import FilterSearch from "./FilterSearch";
import { useTheme } from '../contexts/ThemeProvider';


interface Props {
  trailsCollection: FullTrailDetails[];
  user: User;
  completedTrails: User_Completed_Trail[];
  queuedTrails: User_Queued_Trail[];
  userPurchasedTrails: User_Purchased_Trail[]
  queuedTrailMap: Map<string, string>;
}

const TrailsList = ({
                      trailsCollection,
                      user,
                      userPurchasedTrails,
    completedTrails, queuedTrailMap
                    }: Props) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme } = useTheme();
const styles = getStyles(theme);


  // Debounce the search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800); // Delay in milliseconds

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredTrails = useMemo(() => {
    let filtered = trailsCollection;

    if (filter === 'User Purchased') {
      filtered = trailsCollection.filter(trail =>
          userPurchasedTrails.some(purchasedTrail => trail.id == purchasedTrail.trailId)
      );
    } else if (filter === 'Free') {
      //@ts-ignore
      filtered = trailsCollection.filter(trail => trail.is_free === true || trail.is_free == 1);
    } else if (filter === 'Trail Of The Week') {
      //@ts-ignore
      filtered = trailsCollection.filter(trail => trail.trail_of_the_week === true || trail.trail_of_the_week == 1);
    } else if (filter === 'Completed'){
      filtered = trailsCollection.filter(trail =>
          completedTrails.some(completedTrail => trail.id == completedTrail.trailId))
    }

    if (debouncedSearchQuery) {
      filtered = filtered.filter((trail: FullTrailDetails) =>
          trail.trail_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          trail.park_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          trail.state.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [filter, debouncedSearchQuery, trailsCollection, user]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectFilter = (value: React.SetStateAction<string>) => {
    setFilter(value);
    setShowDropdown(false);
  };
//@ts-ignore
  const renderTrailItem = ({ item }) => (
      <EnhancedTrailCard trail={item} key={item.id} user={user} isQueued={queuedTrailMap && item?.id in queuedTrailMap ? queuedTrailMap[item.id] : false} />
  );

  return (
      <View style={styles.container}>
        <FilterSearch
            showSearch={true}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectFilter={selectFilter}
            filter={filter}
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            filterParams={['All', 'User Purchased', 'Free', 'Trail Of The Week', 'Completed']}
        />
        <FlatList
            data={filteredTrails}
            renderItem={renderTrailItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.trailsContainer}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
            getItemLayout={(data, index) => (
                { length: 350, offset: 350 * index, index }
            )}
            removeClippedSubviews={true}
        />
      </View>
  );
};

const enhance = withObservables(
    ['user'],
    ({ user }) => ({
      user,
      completedTrails: user.usersCompletedTrails.observe(),
      queuedTrails: user.usersQueuedTrails.observe(),
      userPurchasedTrails: user.usersPurchasedTrails.observe(),
    })
);

const EnhancedTrailsList = enhance(TrailsList);
export default EnhancedTrailsList;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.exploreBackground,
    },
    trailsContainer: {
      padding: 10,
      paddingBottom: 20,
    },
    trailCard: {
      backgroundColor: theme.trailCardBackground,
      borderRadius: 15,
      marginBottom: 10,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
    },
    trailName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.trailCardText,
    },
    parkName: {
      color: theme.trailCardSecondaryText,
      marginBottom: 5,
    },
    trailStatText: {
      fontSize: 14,
      color: theme.trailCardSecondaryText,
    },
    actionButton: {
      padding: 10,
      backgroundColor: theme.buttonPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: theme.buttonPrimaryText,
      fontWeight: 'bold',
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.modalBackgroundOverlay,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      elevation: 10,
    },
    modalContainer: {
      backgroundColor: theme.modalBackgroundCard,
      borderRadius: 10,
      padding: 20,
      width: '80%',
      zIndex: 10001,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: theme.modalText,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: theme.modalText,
    },
    buttonCancel: {
      backgroundColor: 'gray',
    },
    buttonConfirm: {
      backgroundColor: 'green',
    },
  });

