import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";

import { Database } from "@nozbe/watermelondb";
import { Dropdown } from "react-native-element-dropdown";
import NewSessionHandlers from "../../helpers/Session/newSessionHandlers";
import { SessionCfg } from "../../types/session";
import { Session_Category } from "../../watermelon/models";
import timeOptions from "../../helpers/Session/timeOptions";
import { useAuthContext } from "../../services/AuthContext";

interface Props {
  sessionCfg: SessionCfg;
  setSessionCfg: React.Dispatch<React.SetStateAction<SessionCfg>>;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sessionCategories: Session_Category[] | null;
}

const SettingsModal = ({
  sessionCfg,
  visible,
  setVisible,
  setSessionCfg,
  sessionCategories,
}: Props) => {
  const { isProMember } = useAuthContext();

  const onChangeHandler = useCallback(
    (
      entry: string,
      value: string | string[] | { label: string; value: number } | boolean,
      isProMember: boolean,
    ) => {
      console.log(value);
      const proNotNeeded = ["sessionName", "sessionCategory"];
      if (!isProMember && proNotNeeded.find(i => i === entry) == undefined) {
        Alert.alert("Pro Needed to change this value");
        setSessionCfg(prev => ({ ...prev }));
      } else {
        if (entry === "totalSets") {
          if (!/^d+&/.test(value.toString())) {
            setSessionCfg(prev => ({ ...prev, ["totalSets"]: 3 }));
          }
          return;
        }
        if (entry === "sessionCategory") {
          if (Array.isArray(value) && value) {
            setSessionCfg(prev => ({ ...prev, [entry]: value as [string, string] }));
          }
        }

        if (entry == "autoContinue" && typeof value === "boolean") {
          setSessionCfg(prev => ({ ...prev, [entry]: value }));
        }
        if (typeof value == "object" && "value" in value) {
          setSessionCfg(prev => ({ ...prev, [entry]: value.value }));
        }
      }
    },
    [sessionCfg],
  );

  const timeValueCreator = (
    sessionCfg: SessionCfg,
    key: keyof SessionCfg,
    isProMember: boolean,
  ): any => {
    const value = Number(sessionCfg[key]);
    if (!isProMember) return { label: `${value / 60} minutes`, value: sessionCfg[key] };
    return { label: `${value / 60} minutes`, value: sessionCfg[key] };
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
      testID="settings-modal">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Session Settings</Text>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Session Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Session Title</Text>
              <TextInput
                testID="session-name-input"
                value={sessionCfg.sessionName}
                style={styles.input}
                onChangeText={value => setSessionCfg(prev => ({ ...prev, sessionName: value }))}
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
                data={sessionCategories!}
                labelField="sessionCategoryName"
                valueField="id"
                placeholder="Select a category"
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                onChange={value => {
                  const v: string[] = [value.id, value.sessionCategoryName];
                  onChangeHandler("sessionCategory", v, isProMember);
                }}
              />
            </View>

            <View style={styles.proSection} testID="session-settings-pro-section">
              <View style={styles.proSectionHeader}>
                <Text style={styles.proSectionTitle}>Pro</Text>
                <Text style={styles.proSectionSubtitle}>Customize your session flow</Text>
              </View>

              {/* Time Settings */}
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
                    value={timeValueCreator(sessionCfg, "focusTimeSec", isProMember)}
                    onChange={selectedItem => {
                      onChangeHandler("focusTimeSec", selectedItem, isProMember);
                    }}
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
                    value={timeValueCreator(sessionCfg, "shortBreakSec", isProMember)}
                    onChange={selectedItem => {
                      onChangeHandler("shortBreakSec", selectedItem, isProMember);
                    }}
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
                    value={timeValueCreator(sessionCfg, "longBreakSec", isProMember)}
                    onChange={selectedItem => {
                      onChangeHandler("longBreakSec", selectedItem, isProMember);
                    }}
                  />
                </View>
              </View>

              {/* Sets and Auto-Continue */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Sets</Text>
                  <TextInput
                    testID="sets-input"
                    value={String(sessionCfg.totalSets)}
                    onChangeText={value => {
                      onChangeHandler("autoContinue", value, isProMember);
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Auto-Continue</Text>
                  <Switch
                    testID="auto-continue-switch"
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={sessionCfg.autoContinue ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => {
                      onChangeHandler("autoContinue", !sessionCfg.autoContinue, isProMember);
                    }}
                    value={sessionCfg.autoContinue}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Save and Close */}
          <Pressable
            testID="save-and-close-button"
            style={styles.saveButton}
            onPress={() => {
              // setSessionCfg(prev => ({...cfg}))
              setVisible(false);
            }}>
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "#1c1c1c",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "rgb(7,254,213)",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 5,
  },
  proSection: {
    borderColor: "rgb(7,254,213)",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    padding: 12,
  },
  proSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  proSectionTitle: {
    backgroundColor: "rgb(7,254,213)",
    borderRadius: 999,
    color: "#1c1c1c",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 3,
    textTransform: "uppercase",
  },
  proSectionSubtitle: {
    color: "#ccc",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderColor: "#444",
    borderWidth: 1,
    color: "#fff",
  },
  dropdown: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 10,
    borderColor: "#444",
    borderWidth: 1,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "rgb(7,254,213)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#1c1c1c",
    fontWeight: "bold",
    fontSize: 16,
  },
});
