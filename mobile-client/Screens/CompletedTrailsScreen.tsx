import * as React from 'react';

import {User_Completed_Trail, User} from '../watermelon/models';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import CompletedTrailCard from '../components/CompletedTrails/CompletedTrailCard';
import SearchBar from '../components/searchBar';
import searchFilterFunction from '../helpers/searchFilter';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  completedTrails: User_Completed_Trail[];
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

const CompletedTrailsScreen = ({user, completedTrails}: Props) => {
  const [search, setSearch] = React.useState<string>('');
  const [filteredDataSource, setFilteredDataSource] = React.useState<
    User_Completed_Trail[] | []
  >([]);
  const [masterDataSource, setMasterDataSource] = React.useState<
    User_Completed_Trail[] | []
  >(completedTrails);

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.header}>Completed Hikes</Text> */}
      <SearchBar
        onSearch={searchFilterFunction}
        search={search}
        masterDataSource={completedTrails}
        setFilteredDataSource={setFilteredDataSource}
        setSearchCallback={setSearch}
        keyToQuery={'trailName'}
      />
      <Text style={styles.totalTrails}>
        Total Completed Trails: {completedTrails.length}
      </Text>
      <FlatList
        data={completedTrails}
        renderItem={({item}) => (
          <CompletedTrailCard key={item.id} completedTrail={item} />
        )}
        ListEmptyComponent={_emptyComponent}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'completedTrails'], ({user}) => ({
  user,
  completedTrails: user.usersCompletedTrails.observe(),
}));

const EnhancedCompletedTrailsScreen = enhance(CompletedTrailsScreen);
export default EnhancedCompletedTrailsScreen;

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
