import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button, Badge } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import {withObservables} from "@nozbe/watermelondb/react";
import {useEffect} from "react";
import {CombinedData, User} from "../../watermelon/models";

interface Props {
    data: CombinedData;
    user: User;
}

const ParkPassCard = ({ data, user }: Props) => {

    const progress = data?.completedTrails / data?.totalTrails
   
    return (
        <Card style={styles.cardContainer}>
            <View style={styles.content}>
                {/* Show Park Level Badge */}
                {data.pass && (
                    <Badge testID={`park-${data.parkId}-level`} style={styles.levelBadge}>{data.pass.parkLevel}</Badge>
                )}

                {/* Park Name */}
                <Text style={styles.title}>{data.parkName}</Text>

                {/* Park Image */}
                { data.pass && data.pass.isRewardRedeemed &&
                    <Image
                        testID={`park-${data.parkId}-completed-badge`}
                        //change image by park level
                        source={
                            require('../../assets/redeemableBadge.png')
                        }
                        style={styles.badgeImage}
                    /> }
                { !data.pass || ( data.pass?.parkLevel <= user.prestigeLevel ) &&
                    <Image
                        testID={`park-${data.parkId}-incomplete-badge`}
                        source={
                            require('../../assets/incompleteBadge.png')
                        }
                    style={styles.badgeImage}
                /> }
                {/* Progress Bar */}
                <Progress.Bar
                    progress={progress}
                    height={12}
                    borderWidth={0}
                    borderRadius={10}
                    color="rgb(7,254,213)"
                    unfilledColor="rgba(0, 0, 0, 0.1)"
                    style={styles.progressBar}
                    key={data.parkId}
                />

                {/* Progress Text */}
                <Text testID={`park-${data.parkId}-progress-text`} style={styles.progressText}>
                    {data.completedTrails}/{data.totalTrails}
                </Text>

                {/* Redeem Button */}
                {progress === 1 && (!data.pass || !data.pass?.isRewardRedeemed) ? (
                    <Button
                        testID={`park-${data.parkId}-redeem-button`}
                        mode="contained"
                        buttonColor="rgb(7,254,213)"
                        onPress={async () => {
                            //redeemParkPass(data.parkId);
                            await user.redeemParkPass(data.parkId)
                            console.log('Redeem reward for park!')
                        }}
                        style={styles.redeemButton}
                        dark={false}
                    >
                        Redeem
                    </Button>
                ) : <></>}
            </View>
        </Card>
    );
};

const enhance = withObservables(['user'], ({ user }) => ({
    user: user.observe()
}));

export default enhance(ParkPassCard);


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
    levelBadge: {
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
