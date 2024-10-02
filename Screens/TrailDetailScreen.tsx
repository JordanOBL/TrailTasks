import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView, Modal, Pressable,
} from 'react-native';
import FullTrailDetails from "../types/fullTrailDetails";
import calculateEstimatedTime from "../helpers/calculateEstimatedTime";
import withObservables from "@nozbe/with-observables";
import {Completed_Hike, User_Purchased_Trail} from "../watermelon/models";
import formatDateTime from "../helpers/formatDateTime";
import BuyTrailModal from "../components/Trails/BuyTrailModal";


// @ts-ignore
const TrailDetailScreen = ({ route, navigation }) => {
    const { trail, user, userPurchasedTrails, completedHikes } = route.params;
    const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
    const [showBuyTrailModal, setShowBuyTrailModal] = useState(false);


    const [errorMessage, setErrorMessage] = useState("");


    const [isFreeTrail, setIsFreeTrail] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isSubscribersOnly, setIsSubscribersOnly] = useState(false);// Assuming this is fetched or calculated elsewhere
    const [isCompleted, setIsCompleted] = useState(false);



    useEffect(() => {

        if (trail && userPurchasedTrails && completedHikes) {
            setIsFreeTrail(trail.is_free);
            setIsPurchased(userPurchasedTrails?.some((purchasedTrail: User_Purchased_Trail) => purchasedTrail.trailId == trail.id));
            setIsSubscribersOnly(trail.is_subscribers_only);
            setIsCompleted(completedHikes.some((hike: Completed_Hike) => hike.trailId === trail.id));
        }


    }, [user, trail, userPurchasedTrails, completedHikes]);


    const trailDistance = parseInt(trail?.trail_distance)
    const trailDifficulty = (() => {
        if (trailDistance > 20) return 'Insane';
        if (trailDistance > 10) return 'Long';
        if (trailDistance > 5) return 'Moderate';
        return 'Short';
    })();

//    const reward = (() => {
//        let calculatedReward = trailDistance;
//        if (true) { //SUBSCRIPTION
//            if (calculatedReward >= 5 && calculatedReward < 10) {
//                calculatedReward = Math.ceil(calculatedReward * 1.5);
//            } else if (calculatedReward >= 10) {
//                calculatedReward = Math.ceil(calculatedReward * 2);
//            }
//        }
//        return Math.ceil(calculatedReward)
//    })();
//

         let calculatedReward = Math.ceil(Number(trailDistance));
      const reward = trail.trail_of_the_week ? calculatedReward * 10 : calculatedReward * 3 < 5 ? 5 : Math.ceil(calculatedReward * 3)

    const getButtonText = () => {
        if (user.trailId === trail?.id) {
            return 'In Progress';
        }

        if (isFreeTrail || isPurchased) {
            return 'Start Now';
        }

        if (isSubscribersOnly && false ) { //!isActiveSubscription
            return 'Unlock With Subscription';
        }

        if (trailDistance < 5) {
            return 'Buy 5';
        } else if (trailDistance < 10) {
            return 'Buy 10';
        } else if (trailDistance < 20) {
            return 'Buy 25';
        } else {
            return 'Buy 100';
        }
    };

    const buttonText = getButtonText();


    if (!trail) {
        return <Text>Loading...</Text>;
    }

    if (errorMessage) {
        return <Text>{errorMessage}</Text>;
    }

    const handleReplaceTrail = async () => {
        // @ts-ignore
        await user.updateUserTrail({
            // @ts-ignore
            trailId: trail.id,
            trailStartedAt: formatDateTime(new Date()),
        });
        setShowReplaceTrailModal(false);

    };

    const handleBuyTrail = (trail:FullTrailDetails) => {
        // @ts-ignore
        setShowBuyTrailModal(true);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Modal and Other Components */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showReplaceTrailModal}
                onRequestClose={() => setShowReplaceTrailModal(false)}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Start New Trail</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to replace your current trail? Trail
                            progress will be RESET. Total miles hiked will be saved.
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setShowReplaceTrailModal(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={() => handleReplaceTrail()}>
                                <Text style={styles.buttonText}>Start New</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <BuyTrailModal
                isVisible={showBuyTrailModal}
                onClose={() => {
                    setShowBuyTrailModal(false)
                    navigation.goBack()
                }}
                trail={trail}
                trailTokens={user.trailTokens}
                onBuyTrail={async (trail, cost) => {
                    const result = await user.purchaseTrail(trail, cost);
                    console.log('Buying trail:', trail);
                }}
            />
            <View style={styles.imageContainer}>
                <Image
                    style={styles.trailImage}
                    source={trail.trail_image_url ? { uri: trail.trail_image_url } : require( '../assets/LOGO.png') }
                />
                <View style={styles.overlayButtons}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.rightButtons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Text style={styles.iconText}>⤴️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Text style={styles.iconText}>⏰</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Text style={styles.iconText}>🔖</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.trailName}>{trail.trail_name}</Text>
                <Text style={styles.parkName}>{trail.park_name} National Park, {trail?.state_code}</Text>
                <Text style={{ color: isCompleted ? 'green' : 'grey', fontSize: 12, marginVertical: 8 }}>
                  {isCompleted ? 'Completed' : 'Not Completed'}</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{trail.trail_distance} mi</Text>
                        <Text style={styles.statLabel}>Trail length</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{trail.trail_elevation} ft</Text>
                        <Text style={styles.statLabel}>Elevation gain</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {calculateEstimatedTime(trail.trail_distance)}
                        </Text>
                        <Text style={styles.statLabel}>Est. time</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{reward}</Text>
                        <Text style={styles.statLabel}>Reward</Text>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity disabled={user.trailId === trail.id || !isFreeTrail || !isPurchased} style={[styles.downloadButton, {
                        backgroundColor:
                            user.trailId === trail.id
                                ? 'grey'
                                : isFreeTrail || isPurchased
                                    ?  '#4CAF50'
                                        : 'grey'

                    }]}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        if (isFreeTrail || isPurchased) {
                            setShowReplaceTrailModal(true);
                        } else if (true || !isSubscribersOnly) { //SUBSCTIPTION
                            handleBuyTrail(trail);
                        }
                    }} style={[styles.navigateButton, {
                        backgroundColor:
                            user.trailId === trail.id
                                ? 'grey'
                                : isFreeTrail || isPurchased
                                    ? 'rgb(7,254,213)'
                                    : true //!isActiveSubscription
                                        ? '#2196F3'
                                        : isSubscribersOnly
                                            ? 'grey'
                                            : 'rgb(7,254,13)'
                    }]}>
                        <Text style={[styles.buttonText]}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const enhance = withObservables(
    ['user'],
    ({ user }) => ({
        user,
        completedHikes: user.completedHikes.observe(),
        queuedTrails: user.queuedTrails.observe(),
        userPurchasedTrails: user.usersPurchasedTrails.observe()
    })
);

const EnhancedTrailDetailScreen = enhance(TrailDetailScreen);
export default EnhancedTrailDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },

    imageContainer: {
        height: 250,
        position: 'relative',
    },
    trailImage: {
        width: '100%',
        height: '100%',
    },
    overlayButtons: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 5,
        borderRadius: 50,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    rightButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        marginLeft: 10,
        borderRadius: 20,
    },
    iconText: {
        color: '#fff',
        fontSize: 18,
    },
    infoContainer: {
        padding: 20,
    },
    parkName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    trailName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    trailStats: {
        fontSize: 16,
        color: '#777',
        marginVertical: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        width: '48%',
        marginBottom: 10,
        backgroundColor: 'rgb(18, 19, 21)',
        padding: 10,
        borderRadius: 5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'rgb(7, 254, 213)',
    },
    statLabel: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    downloadButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    navigateButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 15,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker modal background
    },
    modalContainer: {
        backgroundColor: '#1c1c1c', // Dark background for modal
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: 'white',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: 'white',
    },
    button: {
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },

    buttonCancel: {
        backgroundColor: 'gray',
    },
    buttonConfirm: {
        backgroundColor: 'green',
    },
});
