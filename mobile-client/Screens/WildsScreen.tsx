import {Alert, FlatList, StyleSheet, View} from 'react-native';

// screens/WildsScreen.tsx
import React from 'react';
import WildCard from '../components/Wilds/WildCard'; // adjust path
import wildData from '../assets/wilds/mock_data.json'; // your JSON array

const usersWilds = new Set([ 'scout', 'ember']);

export default function WildsScreen()
{
  // Example handler (replace with navigation logic)
  const handlePress = (id: string) => {
    Alert.alert('Wild selected', `Open details for ${id}`);
    // navigation.navigate('WildDetail', { id });
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={wildData}
      keyExtractor={item => item.id}
      numColumns={2} // 2-column card grid
          renderItem={({ item }) => (
          <View style={{margin:10}}>
                  <WildCard
                      usersWilds={usersWilds}
          id={item.id as any}
          name={item.name}
          level={item.starting_level}
          xpPercent={0} // TODO: real XP%
          perkName={item.perk_name}
          perkDescription={item.perk_description}
          rarity={item.rarity as any}
                      isLocked={!usersWilds.has(item.id)} // example lock logic
            isActive={item.is_active}
          onPress={() => handlePress(item.id)}
                  />
                  </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
        padding: 16,
        margin: 0,
        alignItems: "center",
  },
});
