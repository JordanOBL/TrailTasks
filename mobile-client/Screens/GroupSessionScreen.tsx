import React from "react";

import ComingSoon from "../components/ComingSoon";

const GroupSessionScreen = (_props: any) => (
  <ComingSoon
    title="Group sessions are coming soon"
    message="Group sessions need the new session model, message bus work, and WebSocket/server validation before they belong in MVP."
    detail="Solo sessions are still the supported path for focus, trail progress, rewards, and release testing."
  />
);

export default GroupSessionScreen;
