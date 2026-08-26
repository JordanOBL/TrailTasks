import React from "react";

import ComingSoon from "../components/ComingSoon";

const AchievementsScreen = (_props: any) => (
  <ComingSoon
    title="Achievements are coming soon"
    message="Achievement tracking is not part of the tested MVP path yet."
    detail="For now, completed solo sessions still move your trail progress forward while achievements stay out of the release surface."
  />
);

export default AchievementsScreen;
