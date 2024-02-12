import {StyleSheet, Text, SafeAreaView, FlatList, View} from 'react-native';
import * as React from 'react';
import withObservables from '@nozbe/with-observables';
import {Completed_Hike, User} from '../watermelon/models';
import CompletedHikeCard from '../components/CompletedHikes/CompletedHikeCard';
import searchFilterFunction from '../helpers/searchFilter';
import SearchBar from '../components/searchBar';
interface Props {
  user: User;
  completedHikes: Completed_Hike[];
}
const _emptyComponent = () => {
  return (
    <View style={styles.emptyWrapper}>
      <Text style={[styles.TrailName, {textAlign: 'center'}]}>
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
  const [masterDataSource, setMasterDataSource] =
    React.useState<Completed_Hike[] | []>(completedHikes);
  
  console.log(completedHikes);
  return (
    <SafeAreaView>
      <Text>CompletedHikes</Text>
      <SearchBar
        onSearch={searchFilterFunction}
        search={search}
        masterDataSource={completedHikes}
        setFilteredDataSource={setFilteredDataSource}
        setSearchCallback={setSearch}
        keyToQuery={"trailName"}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: 'white',
          padding: 10,
        }}>
        Total Completed Trails: {completedHikes.length}
      </Text>
      <FlatList
        data={completedHikes}
        renderItem={({item}) => (
          <CompletedHikeCard key={item.id} completedHike={item} />
        )}
        ListEmptyComponent={_emptyComponent}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'completedHikes'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe()
  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedCompletedHikesScreen = enhance(CompletedHikesScreen);
export default EnhancedCompletedHikesScreen;

const styles = StyleSheet.create({
  TrailContainer: {
    padding: 10,
    flex: 1,
    backgroundColor: 'rgb(31, 33, 35)',
    borderRadius: 10,
  },
  TrailName: {
    fontSize: 26,
    fontWeight: '800',
    color: 'rgb(7,254,213)',
    padding: 5,
  },
  TrailStats: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(221,224,226)',
    padding: 5,
  },
  TrailPark: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgb(221,224,226)',
    padding: 5,
  },
  emptyWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
});
