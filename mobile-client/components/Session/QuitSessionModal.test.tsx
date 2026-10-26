import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Modal, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuitSessionModal from "./QuitSessionModal";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";

const sessionDetails = { totalSets: 3, completedSets: 1 } as SessionSnapshot;

describe("QuitSessionModal presentation", () => {
  it("uses a full-screen native modal instead of an overlay bounded by the session", () => {
    const screen = render(
      <QuitSessionModal isVisible sessionDetails={sessionDetails} cancel={jest.fn()} quit={jest.fn()} />,
    );
    const modal = screen.UNSAFE_getByType(Modal);
    expect(modal.props).toMatchObject({
      visible: true,
      transparent: true,
      statusBarTranslucent: true,
      navigationBarTranslucent: true,
      presentationStyle: "overFullScreen",
    });
    const safeArea = screen.UNSAFE_getByType(SafeAreaView);
    expect(StyleSheet.flatten(safeArea.props.style)).toMatchObject({
      flex: 1, justifyContent: "center", alignItems: "center",
    });
    expect(screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle).toBeDefined();
  });

  it("treats Android back as cancel/resume, never as a confirmed quit", () => {
    const cancel = jest.fn();
    const quit = jest.fn();
    const screen = render(
      <QuitSessionModal isVisible sessionDetails={sessionDetails} cancel={cancel} quit={quit} />,
    );
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(quit).not.toHaveBeenCalled();
  });

  it("keeps separate accessible quit and resume controls", () => {
    const cancel = jest.fn();
    const quit = jest.fn();
    const screen = render(
      <QuitSessionModal isVisible sessionDetails={sessionDetails} cancel={cancel} quit={quit} />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Cancel and resume session" }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(quit).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole("button", { name: "Confirm quit session" }));
    expect(quit).toHaveBeenCalledTimes(1);
  });

  it("does not expose confirmation controls when closed", () => {
    const screen = render(
      <QuitSessionModal isVisible={false} sessionDetails={sessionDetails} cancel={jest.fn()} quit={jest.fn()} />,
    );
    expect(screen.queryByTestId("quit-session-modal")).toBeNull();
  });
});
