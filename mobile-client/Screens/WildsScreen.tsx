import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import Rive from 'rive-react-native'
import WildCard from '../components/Wilds/WildCard'; // adjust path
// screens/WildsScreen.tsx
import wildData from '../assets/wilds/mock_data.json'; // your JSON arrary
import { withObservables } from '@nozbe/watermelondb/react';

//const usersWilds = new Set(['scout', 'ember']);

const  WildsScreen = ({user, route}) =>
{

  // Example handler (replace with navigation logic)
  const {userWilds} = route.params || {};
  
  console.log('WildsScreen userWilds:', userWilds);
  const handlePress = (id: string) => {
    Alert.alert('Wild selected', `Open details for ${id}`);
    // navigation.navigate('WildDetail', { id });
  };

  const createHiddenText = React.useCallback((text: string) => {
    return Array.from(text)
      .map(_ => '?')
      .join('');
  }, []);

  const rItem = React.useCallback(({ item }) =>
  {
    return (
   <View style={{margin: 10}}>
     <WildCard
       wild={item}
       //isLocked={!usersWilds.has(item.id)} // example lock logic
       isLocked={false}
       isActive={item?.is_active}
       onPress={() => handlePress(item.id)}
       createHiddenText={createHiddenText}
     />
   </View>)
  }, [createHiddenText])

  // React.useEffect(() => {

  //   async function getWilds(){
  //    const results = await database.get('wilds').query().fetch();
  //   console.log(results)
  //   }
  //  getWilds()
  // })

  if (!userWilds || userWilds.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white'}}>No Wilds Found</Text>
        <Text style={{color: 'white'}}>Complete All Trails in a Park To Unlock a Wild</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={userWilds}
      keyExtractor={item => item.id}
      numColumns={2} // 2-column card grid
      renderItem={rItem}
    />
  );
}

const enhance = withObservables(['user'], ({user}) => ({
    user: user.observe(),
    usersWilds: user.usersWilds.observe(),
}));

const EnhancedWildsScreen = enhance(WildsScreen);
export default EnhancedWildsScreen;


const styles = StyleSheet.create({
  container: {
        padding: 16,
        margin: 0,
        alignItems: 'center',
  },
});
