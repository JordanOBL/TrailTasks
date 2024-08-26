import React, { useMemo, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import withObservables from "@nozbe/with-observables";

import {Completed_Hike, Queued_Trail, User, User_Purchased_Trail} from "../watermelon/models";

import EnhancedTrailCard from './Trails/TrailCard';

import FullTrailDetails from "../types/fullTrailDetails";



interface Props {
  trailsCollection:FullTrailDetails[];
   user:User;
   completedHikes: Completed_Hike[];
   queuedTrails:Queued_Trail[];
   userPurchasedTrails:User_Purchased_Trail[];
}

const TrailsList = ({
                        trailsCollection,
                        user,
                        userPurchasedTrails,
                      }:Props) => {

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);


  const filteredTrails = useMemo(() => {
    let filtered = trailsCollection;

    if (filter === 'userPurchased') {
      // @ts-ignore

      filtered = trailsCollection.filter(trail => userPurchasedTrails.some(purchasedTrail => trail.id == purchasedTrail.trailId));
    } else if (filter === 'free') {
      // @ts-ignore
      filtered = trailsCollection.filter(trail => trail.is_free === true || trail.is_free === 1);;
    } else if (filter === 'trailOfTheWeek') {
      // @ts-ignore
      filtered = trailsCollection.filter(trail => trail.trail_of_the_week === true || trail.trail_of_the_week === 1);
    }

    if (searchQuery) {
      filtered = filtered.filter((trail:FullTrailDetails) => trail.trail_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return filtered;
  }, [filter, searchQuery, trailsCollection, user]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectFilter = (value: React.SetStateAction<string>) => {
    setFilter(value);
    setShowDropdown(false);
  };



  // @ts-ignore
  const renderTrailItem = ({ item }) => (
      <EnhancedTrailCard trail={item} user={user}   />
  );

  return (
      <View style={styles.container}>
        {/* Search and Filter UI */}
        <View style={styles.filterContainer}>
          <TextInput
              style={styles.searchInput}
              placeholder="Search trails..."
              placeholderTextColor="#ccc"
              value={searchQuery}
              onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Filter: {filter}</Text>
          </TouchableOpacity>
          {showDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectFilter('all')}>
                  <Text style={styles.dropdownText}>All Trails</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectFilter('userPurchased')}>
                  <Text style={styles.dropdownText}>User Purchased</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectFilter('free')}>
                  <Text style={styles.dropdownText}>Free Trails</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectFilter('trailOfTheWeek')}>
                  <Text style={styles.dropdownText}>Trail of the Week</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>

        {/* Render filtered trails */}
        <FlatList
            data={filteredTrails}
            renderItem={renderTrailItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.trailsContainer}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            getItemLayout={(data, index) => (
                { length: 200, offset: 200 * index, index } // Assuming each item height is 200
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
      userPurchasedTrails: user.usersPurchasedTrails.observe()
    })
);

const EnhancedTrailsList = enhance(TrailsList);
export default EnhancedTrailsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Black background
  },
  trailsContainer: {
    padding: 10,
    paddingBottom: 20, // Space at the bottom to prevent content from being hidden
  },
  filterContainer: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#1c1c1c', // Dark background for filter container
    borderBottomWidth: 1,
    borderColor: '#333',
    zIndex: 1000, // Ensure dropdown is above other elements
    elevation: 5,// Darker border color
  },
  searchInput: {
    borderRadius: 10,
    borderColor: '#333',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#222', // Dark input background
    color: '#fff', // White text color
  },
  dropdownButton: {
    backgroundColor: '#333', // Dark background for dropdown button
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', // Center the button within its container
    width: 200,
  },
  dropdownButtonText: {
    color: '#fff', // White text color for dropdown button
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#333', // Dark background for dropdown
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444', // Darker border color for dropdown
    marginTop: 5,
    zIndex: 1000, // Ensure dropdown is above other elements
    elevation: 5, // Adds shadow for Android
    alignSelf: 'center', // Center the dropdown under the button
    width: 200, // Adds shadow for Android// Ensure dropdown is above other elements
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#444', // Darker border color for dropdown items
  },
  dropdownText: {
    color: '#fff', // White text color for dropdown items
  },
  trailCard: {
    backgroundColor: '#1c1c1c', // Dark background for trail card
    borderRadius: 15,
    marginBottom: 10, // Margin at the bottom to space out cards
    overflow: 'hidden',
    elevation: 3, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, // Slightly stronger shadow opacity
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
    color: '#fff', // White text color for trail name
  },
  parkName: {
    color: '#aaa', // Lighter text color for park name
    marginBottom: 5,
  },
  trailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trailStatText: {
    fontSize: 14,
    color: '#ddd', // Lighter text color for trail stats
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker modal background
    position: 'absolute', // Ensure it covers the screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000, // Ensure modal is on top
    elevation: 10, // Adds shadow for Android
  },
  modalContainer: {
    backgroundColor: '#1c1c1c', // Dark background for modal
    borderRadius: 10,
    padding: 20,
    width: '80%',
    zIndex: 10001, // Ensure modal content is on top
    elevation: 10, // Adds shadow for Android
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