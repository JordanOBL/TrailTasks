import {Text, TextInput, TouchableOpacity, View, StyleSheet, GestureResponderEvent} from "react-native";
import React, {SetStateAction} from "react";

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

const styles = StyleSheet.create({
    filterContainer: {
        position: 'relative',
        padding: 10,
         // Dark background for filter container
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
})