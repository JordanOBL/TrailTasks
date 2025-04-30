import {FlatList, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import {Session_Category} from '../../watermelon/models';
import formatTime from '../../helpers/formatTime';

interface Props {
  filteredUserSessions: any[];
  sessionCategories: Session_Category[];
}

const SessionList = ({filteredUserSessions}: Props) => {
  // @ts-ignore
  const renderSessionItem = ({item}) => (
    <View style={styles.sessionContainer} testID={`session-list-item-${item.id}`}>
      <Text style={styles.title}>{item.session_name}</Text>
      <Text style={styles.category}>
        Category: {item.session_category_name}
      </Text>
      {item.sessionDescription && (
        <Text style={styles.description}>
          Description: {item.session_description}
        </Text>
      )}
      <Text style={styles.date}>Date: {item.date_added}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>Miles: {item.total_distance_hiked} mi.</Text>
        <Text style={styles.info}>
          Time: {formatTime(item.total_session_time)}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      testID="sessions-list"
      data={filteredUserSessions}
      renderItem={renderSessionItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

export default SessionList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgb(18, 19, 21)',
  },
  sessionContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgb(31, 33, 35)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'rgb(221, 224, 226)',
  },
  category: {
    fontSize: 16,
    marginBottom: 8,
    color: 'rgb(221, 224, 226)',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    fontStyle: 'italic',
    color: 'rgb(221, 224, 226)',
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
    color: 'rgb(221, 224, 226)',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    fontSize: 16,
    color: 'rgb(221, 224, 226)',
  },
});
