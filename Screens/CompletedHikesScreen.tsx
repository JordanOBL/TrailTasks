import * as React from 'react';

import {Completed_Hike, User} from '../watermelon/models';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import CompletedHikeCard from '../components/CompletedHikes/CompletedHikeCard';
import SearchBar from '../components/searchBar';
import searchFilterFunction from '../helpers/searchFilter';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
  completedHikes: Completed_Hike[];
}

const _emptyComponent = () => {
  return (
    <View style={styles.emptyWrapper}>
      <Text style={[styles.emptyText, {textAlign: 'center'}]}>
        Come back when you've completed a hike!
      </Text>
    </View>
  );
};

const CompletedHikesScreen = ({user, completedHikes}: Props) => {
  const [search, setSearch] = React.useState<string>('');
  const [filteredDataSource, setFilteredDataSource] = React.useState<
    Completed_Hike[] | []
  >([]);
  const [masterDataSource, setMasterDataSource] = React.useState<
    Completed_Hike[] | []
  >(completedHikes);

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.header}>Completed Hikes</Text> */}
      <SearchBar
        onSearch={searchFilterFunction}
        search={search}
        masterDataSource={completedHikes}
        setFilteredDataSource={setFilteredDataSource}
        setSearchCallback={setSearch}
        keyToQuery={'trailName'}
      />
      <Text style={styles.totalTrails}>
        Total Completed Trails: {completedHikes.length}
      </Text>
      <FlatList
        data={completedHikes}
        renderItem={({item}) => (
          <CompletedHikeCard key={item.id} completedHike={item} />
        )}
        ListEmptyComponent={_emptyComponent}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'completedHikes'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
}));

const EnhancedCompletedHikesScreen = enhance(CompletedHikesScreen);
export default EnhancedCompletedHikesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  totalTrails: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'white',
  },
});
