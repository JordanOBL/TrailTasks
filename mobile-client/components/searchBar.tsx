import React, {useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';

interface Props {
  onSearch: any;
  search: string;
  masterDataSource: any[];
  setFilteredDataSource: React.Dispatch<React.SetStateAction<any[]>>;
  setSearchCallback: React.Dispatch<React.SetStateAction<string>>;
  keyToQuery: string;
  debounceTime?: number;
}

const SearchBar = ({
  onSearch,
  search,
  masterDataSource,
  setFilteredDataSource,
  setSearchCallback,
  debounceTime,
  keyToQuery,
}: Props) => {
  const handleSearch = (text: string) => {
    onSearch(
      text,
      masterDataSource,
      setFilteredDataSource,
      setSearchCallback,
      keyToQuery
    );
  };

  return (
    <TextInput
      style={styles.input}
      placeholder="Search..."
      placeholderTextColor={'white'}
      value={search}
      onChangeText={(text: string) => handleSearch(text)}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'rgba(61,63,65,1)',
  },
});

export default SearchBar;
