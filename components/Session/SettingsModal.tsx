import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import NewSessionHandlers from '../../helpers/Session/newSessionHandlers';
import timeOptions from '../../helpers/Session/timeOptions'
;import { SegmentedButtons } from 'react-native-paper';

const SettingsModal = ({
                           timer,
                           setTimer,
                           isSettingsModalVisible,
                           setIsSettingsModalVisible,
                           setSessionDetails,
                           sessionDetails,
                           watermelonDatabase,
                           sessionCategories,
                       }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isSettingsModalVisible}
            onRequestClose={() => setIsSettingsModalVisible(false)}
            testID="settings-modal"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Session Settings</Text>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.segmentedButtonContainer}>
                            <Text style={styles.label}>Type</Text>
                            <SegmentedButtons
                                buttons={[{ value: 'POMODORO', label: 'Pomodoro', style: sessionDetails.type == 
                                'POMODORO' ? {backgroundColor: 'rgb(7,254,213)'} : {backgroundColor: 'black'}, labelStyle: sessionDetails.type == 
                                'POMODORO' ? {color: 'black'} : {color: 'rgba(255,255,255,0.5)'}}, { value: 'PHYSICAL', label: 'Physical', style: sessionDetails.type == 
                                'PHYSICAL' ? {backgroundColor: 'rgb(7,254,213)'} : {backgroundColor: 'black'}, labelStyle : sessionDetails.type == 
                                'PHYSICAL' ? {color: 'black'} : {color: 'rgba(255,255,255,0.5)'} }]}
                                density="small"
                                testID="session-type-switch"
                                onValueChange={(value) => {
                                    setTimer((prev) => ({ ...prev, type: value }))
                                    setSessionDetails((prev) => ({ ...prev, type: value }))
                                }} 
                                style={styles.segmentedButton}
                            />
                        </View>
                        {/* Session Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Session Title</Text>
                            <TextInput
                                testID="session-name-input"
                                value={sessionDetails.sessionName}
                                style={styles.input}
                                onChangeText={(value) => NewSessionHandlers.SessionNameChange({ setSessionDetails, value })}
                                placeholder="Enter session name"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                            />
                        </View>

                        {/* Category Dropdown */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Category</Text>
                            <Dropdown
                                testID="session-category-dropdown"
                                itemTestIDField="category-dropdown-selection"
                                style={styles.dropdown}
                                data={sessionCategories}
                                labelField="sessionCategoryName"
                                valueField="id"
                                placeholder="Select a category"
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                value={sessionDetails.sessionCategoryId}
                                onChange={(value) =>
                                    NewSessionHandlers.SelectSessionCategoryId({
                                        setTimer,
                                        setSessionDetails,
                                        sessionCategoryId: value.id,
                                        database: watermelonDatabase,
                                    })
                                }
                            />
                        </View>

                        {/* Time Settings */}
                        {sessionDetails.type === 'POMODORO' && (
                            
                            <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Focus Time</Text>
                                <Dropdown
                                    testID="focus-time-dropdown"
                                    style={styles.dropdown}
                                    data={timeOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select time"
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    value={timer.focusTime}
                                    onChange={(selectedItem) =>
                                        NewSessionHandlers.FocusTimeChange({ setTimer, value: selectedItem.value })
                                    }
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.label}>Short Break</Text>
                                <Dropdown
                                    testID="short-break-dropdown"
                                    style={styles.dropdown}
                                    data={timeOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select time"
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    value={timer.shortBreakTime}
                                    onChange={(selectedItem) =>
                                        NewSessionHandlers.ShortBreakChange({ setTimer, value: selectedItem.value })
                                    }
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.label}>Long Break</Text>
                                <Dropdown
                                    testID="long-break-dropdown"
                                    style={styles.dropdown}
                                    data={timeOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select time"
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    value={timer.longBreakTime}
                                    onChange={(selectedItem) =>
                                        NewSessionHandlers.LongBreakChange({ setTimer, value: selectedItem.value })
                                    }
                                />
                            </View>
                        </View>
                        )}
{sessionDetails.type === 'POMODORO' && 
    

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Sets</Text>
                                <TextInput
                                    testID="sets-input"
                                    value={String(timer.sets)}
                                    onChangeText={(value) =>
                                        setTimer((prev) => ({ ...prev, sets: parseInt(value, 10) || 1 }))
                                    }
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.label}>Auto-Continue</Text>
                                <Switch
                                    testID="auto-continue-switch"
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={timer.autoContinue ? '#f5dd4b' : '#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() =>
                                        setTimer((prev) => ({ ...prev, autoContinue: !timer.autoContinue }))
                                    }
                                    value={timer.autoContinue}
                                />
                            </View>
                        </View>
                        }
                    </ScrollView>

                    {/* Save and Close */}
                    <Pressable testID="save-and-close-button" style={styles.saveButton} onPress={() => setIsSettingsModalVisible(false)}>
                        <Text style={styles.buttonText}>Save & Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default SettingsModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        backgroundColor: '#1c1c1c',
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: 'rgb(7,254,213)',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    fieldContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ccc',
        marginVertical: 15,
    },
    input: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        fontSize: 14,
        borderColor: '#444',
        borderWidth: 1,
        color: '#fff',
    },
    dropdown: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 10,
        borderColor: '#444',
        borderWidth: 1,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: 'rgb(7,254,213)',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#1c1c1c',
        fontWeight: 'bold',
        fontSize: 16,
    },
    segmentedButtonContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20,
        padding: 20,
    },
});
