import React from "react";

import ComingSoon from "../components/ComingSoon";

const FriendsScreen = (_props: any) => (
  <ComingSoon
    title="Friends are coming soon"
    message="Friend activity is not part of the tested MVP path yet."
    detail="This avoids showing stale social data or untested group-session entry points before the friend flow is ready."
  />
);

export default FriendsScreen;
