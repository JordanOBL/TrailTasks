import React, { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
} from 'react-native';
import withObservables from "@nozbe/with-observables";
import { Completed_Hike, Queued_Trail, User, User_Purchased_Trail } from "../watermelon/models";
import EnhancedTrailCard from './Trails/TrailCard';
import FullTrailDetails from "../types/fullTrailDetails";
import FilterSearch from "./FilterSearch";

interface Props {
  trailsCollection: FullTrailDetails[];
  user: User;
  completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
  userPurchasedTrails: User_Purchased_Trail[];
}

const TrailsList = ({
                      trailsCollection,
                      user,
                      userPurchasedTrails,
                    }: Props) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce the search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 2000); // Delay in milliseconds

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
      <EnhancedTrailCard trail={item} user={user} />
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
            filterParams={['All', 'User Purchased', 'Free', 'Trail Of The Week']}
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
      completedHikes: user.completedHikes.observe(),
      queuedTrails: user.queuedTrails.observe(),
      userPurchasedTrails: user.usersPurchasedTrails.observe(),
    })
);

const EnhancedTrailsList = enhance(TrailsList);
export default EnhancedTrailsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  trailsContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  trailCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  trailImage: {
    width: '100%',
    height: 150,
  },
  trailInfo: {
    padding: 10,
  },
  trailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  parkName: {
    color: '#aaa',
    marginBottom: 5,
  },
  trailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trailStatText: {
    fontSize: 14,
    color: '#ddd',
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    elevation: 10,
  },
  modalContainer: {
    backgroundColor: '#1c1c1c',
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
    color: 'white',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonCancel: {
    backgroundColor: 'gray',
  },
  buttonConfirm: {
    backgroundColor: 'green',
  },
});