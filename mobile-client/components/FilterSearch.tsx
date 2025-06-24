import {Text, TextInput, TouchableOpacity, View, StyleSheet, GestureResponderEvent} from "react-native";
import React, {SetStateAction} from "react";
import {useTheme} from "../contexts/ThemeProvider";

interface Props {
    searchQuery?: string;
    setSearchQuery?:React.Dispatch<React.SetStateAction<string>>;
    toggleDropdown: (event: GestureResponderEvent) => void;
    filter: string;
    showDropdown: boolean;
    selectFilter: (value: string) => void;
    filterParams: string[];
    bgColor?: string;
    showSearch?: boolean

}

const FilterSearch = ({searchQuery,showSearch, setSearchQuery, toggleDropdown, bgColor,  filter, showDropdown, selectFilter, filterParams}:Props) =>{
    const {theme} = useTheme();
    const styles = getStyles(theme);

    return (

    <View style={[styles.filterContainer, {backgroundColor: bgColor ? bgColor :  '#1c1c1c' }]}>
        {showSearch && <TextInput
            style={styles.searchInput}
            placeholder="Search trails..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />}
        <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Filter: {filter}</Text>
        </TouchableOpacity>
        {showDropdown && (
            <View style={styles.dropdown}>
                {filterParams.map((param: string) => (
                    <TouchableOpacity style={styles.dropdownItem} key={param} onPress={() => selectFilter(param)}>
                        <Text style={styles.dropdownText}>{param}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        )}
    </View>

)
}
export default FilterSearch;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    filterContainer: {
      position: 'relative',
      padding: 10,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderColor: theme.border,
      zIndex: 1000,
      elevation: 5,
    },
    searchInput: {
      borderRadius: 10,
      borderColor: theme.border,
      borderWidth: 1,
      padding: 10,
      marginBottom: 10,
      backgroundColor: theme.inputBackground,
      color: theme.inputText,
    },
    dropdownButton: {
      backgroundColor: theme.border,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      width: 200,
    },
    dropdownButtonText: {
      color: theme.text,
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: theme.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 5,
      zIndex: 1000,
      elevation: 5,
      alignSelf: 'center',
      width: 200,
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    dropdownText: {
      color: theme.text,
    },
  });

