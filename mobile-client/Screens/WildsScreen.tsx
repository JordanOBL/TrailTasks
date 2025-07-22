import {Alert, FlatList, StyleSheet, View} from 'react-native';

// screens/WildsScreen.tsx
import React from 'react';
import Rive from 'rive-react-native'
import WildCard from '../components/Wilds/WildCard'; // adjust path
import wildData from '../assets/wilds/mock_data.json'; // your JSON arrary

const usersWilds = new Set(['scout', 'ember']);

export default function WildsScreen()
{
  // Example handler (replace with navigation logic)
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
       usersWilds={usersWilds}
       item={item}
       //isLocked={!usersWilds.has(item.id)} // example lock logic
       isLocked={false}
       isActive={item?.is_active}
       onPress={() => handlePress(item.id)}
       createHiddenText={createHiddenText}
     />
   </View>)
  }, [createHiddenText])
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={wildData}
      keyExtractor={item => item.id}
      numColumns={2} // 2-column card grid
      renderItem={rItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
        padding: 16,
        margin: 0,
        alignItems: 'center',
  },
});
