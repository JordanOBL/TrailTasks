import React, { useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, View, Dimensions, Easing } from 'react-native';

const NationalParksInfiniteScroll = () => {
    const screenWidth = Dimensions.get('window').width;

    const parks = [
        "Arches",
        'Badlands',
        "Big Bend",
        "Biscayne",
        "Black Canyon of the Gunnison",
        "Bryce Canyon",
        "Canyonlands",
        "Capitol Reef",
        "Carlsbad Caverns",
        "Channel Islands",
        "Congaree",
        "Crater Lake",
        "Cuyahoga Valley",
        "Death Valley",
        "Denali",
        "Dry Tortugas",
        "Everglades",
        "Gates of the Arctic",
        "Gateway Arch",
        "Glacier Bay",
        "Glacier",
        "Grand Canyon",
        "Grand Teton",
        "Great Basin",
        "Great Sand Dunes",
        "Great Smoky Mountains",
        "Guadalupe Mountains",
        "Haleakala",
        "Hawaii Volcanoes",
        "Hot Springs",
        "Indiana Dunes",
        "Isle Royale",
        "Joshua Tree",
        "Katmai",
        "Kenai Fjords",
        "Kings Canyon",
        "Kobuk Valley",
        "Lake Clark",
        "Lassen Volcanic",
        "Mammoth Cave",
        "Mesa Verde",
        "Mount Rainier",
        "New River Gorge",
        "North Cascades",
        "Olympic",
        "Petrified Forest",
        "Pinnacles",
        "Redwood",
        "Rocky Mountain",
        "Saguaro",
        "Sequoia",
        "Shenandoah",
        "Theodore Roosevelt",
        "Virgin Islands",
        "Voyageurs",
        "White Sands",
        "Wind Cave",
        "Wrangell-St. Elias",
        "Acadia",
        "American Samoa",

    ];

    // Duplicate the parks array to ensure smooth scrolling
    const parksList = [...parks, ...parks];

    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startScrolling = () => {
            scrollX.setValue(0);
            Animated.timing(scrollX, {
                toValue: 1,
                duration: 550000, // Adjust duration for faster or slower scrolling
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => startScrolling());
        };

        startScrolling();
    }, [scrollX]);

    const translateX = scrollX.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -screenWidth * parks.length], // Adjust the output range to account for all parks
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    flexDirection: 'row',
                    transform: [{ translateX }],
                }}
            >
                {parksList.map((park, index) => (
                    <Text key={index} style={styles.parkName}>
                        {park}
                    </Text>
                ))}
            </Animated.View>
        </View>
    );
};

export default NationalParksInfiniteScroll;

const styles = StyleSheet.create({
    container: {
        height: 50,
        overflow: 'hidden',
        backgroundColor: 'black',
    },
    parkName: {
        fontSize: 16,
        color: 'white',
        paddingHorizontal: 20,
        opacity: 0.4,
        letterSpacing: 8,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
});
