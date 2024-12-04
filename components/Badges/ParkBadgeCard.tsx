import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import {Card, Text, Button, Badge} from 'react-native-paper';
import * as Progress from 'react-native-progress';

const ParkBadgeCard = ({ data, badge }) => {
    const progress = data.trails.length > 0 ? data.completed / data.trails.length : 0;

    return (
        <Card style={styles.cardContainer}>

            <View style={styles.content}>
                {!data.badge?.quantity && <Badge style={styles.quantityBadge}>{3}</Badge>}
                <Text style={styles.title}>{badge.badgeName}</Text>
                <Image
                    source={progress == 1 ? require('../../assets/redeemableBadge.png') : require('../../assets/incompleteBadge.png')}
                    style={styles.badgeImage}
                />
                <Progress.Bar
                    progress={progress}
                    height={12}
                    borderWidth={0}
                    borderRadius={10}
                    color="rgb(7,254,213)"
                    unfilledColor="rgba(0, 0, 0, 0.1)"
                    style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                    {data.completed}/{data.trails.length}
                </Text>
                {progress == 1 && (<Button
                    mode="contained"
                    buttonColor={progress > 1 ? "rgba(255,255,255,.4)" : "rgb(7,254,213)"}
                    onPress={() => console.log('Redeem badge!')}
                    style={styles.redeemButton}
                    dark={false}
                    disabled={progress > 1}
                >
                    Redeem
                </Button>)}

            </View>
        </Card>
    );
};

export default ParkBadgeCard;

// Styles
const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 12,
        margin: 10,
        backgroundColor: '#fff',
        width: 160, // Match consistent size for a grid layout
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quantityBadge:{
        position: 'absolute',
        top: -5,
        left: -10,
        backgroundColor: "gold",
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    badgeImage: {
        width: 64,
        height: 64,
        margin: 10,

    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        color: '#333',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    progressBar: {
        width: '100%',

    },
    progressText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#666',
        margin: 10,
    },
    redeemButton: {
        marginTop: 8,
        borderRadius: 20,
    },
});
