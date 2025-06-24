import React from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import EnhancedAddonListItem from '../AddOnStore/AddonListItem';

const BackpackModal = ({
                           isVisible,
                           onClose,
                           sessionDetails,
                           setSessionDetails,
                           user,
                           usersAddons,
                       }) => {
    const selectAddon = (addon) => {
        const position = sessionDetails.backpack.findIndex(
            (slot) => slot.addon === null
        );

        if (addon && sessionDetails.backpack.some((slot) => slot.addon?.id === addon.id)) {
            Alert.alert('Addon already in backpack', 'Addons do not stack.');
            return;
        }

        if (position >= 0) {
            const updatedBackpack = [...sessionDetails.backpack];
            updatedBackpack[position].addon = addon;
            setSessionDetails({ ...sessionDetails, backpack: updatedBackpack });
        }

        onClose();
    };

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Manage Backpack</Text>

                    <View style={styles.backpackContainer}>
                        {sessionDetails.backpack.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.backpackSlot,
                                    {
                                        borderColor: user.totalMiles >= slot.minimumTotalMiles ? 'rgb(7,254,213)' : 'grey',
                                    },
                                ]}
                                onPress={() => {
                                    if (user.totalMiles >= slot.minimumTotalMiles) {
                                        selectAddon(slot.addon ? null : null); // Opens empty or removes existing
                                    } else {
                                        Alert.alert('Locked', `Unlock at ${slot.minimumTotalMiles} miles.`);
                                    }
                                }}
                            >
                                <Text
                                    style={[
                                        styles.slotText,
                                        { color: user.totalMiles >= slot.minimumTotalMiles ? 'rgb(7,254,213)' : 'grey' },
                                    ]}
                                >
                                    {slot.addon?.name || (user.totalMiles >= slot.minimumTotalMiles ? '+' : `Unlock at ${slot.minimumTotalMiles}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ScrollView style={styles.addonList}>
                        <Text style={styles.listTitle}>Available Addons</Text>
                        {usersAddons.length > 0 ? (
                            usersAddons.map((userAddon, index) => (
                                <EnhancedAddonListItem
                                    key={index}
                                    userAddon={userAddon}
                                    selectAddon={selectAddon}
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Inventory empty. Visit the shop to buy addons!</Text>
                        )}
                    </ScrollView>

                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default BackpackModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'rgb(28, 29, 31)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgb(7,254,213)',
        marginBottom: 20,
    },
    backpackContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '100%',
    },
    backpackSlot: {
        width: '45%',
        height: 50,
        borderWidth: 2,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    slotText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    addonList: {
        width: '100%',
        maxHeight: '50%',
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: 'grey',
        textAlign: 'center',
        marginVertical: 10,
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgb(7,254,213)',
        borderRadius: 8,
    },
    buttonText: {
        color: 'rgb(28,29,31)',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
