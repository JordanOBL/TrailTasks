Event_Name | Emmitter | Listener/consumer | Payload shape | Category
|--|--|--|--|--|
SESSION_STARTED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact 
SESSION_PHASE_CHANGED | SessionEngine | RewardsService, PersistenceService, UI | SessionPhaseChangedPayload | Domain Fact
SESSION_PACE_INCREASED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_TICK | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_SET_COMPLETED | SessionEngine | RewardsService, PersistenceService, UI | SessionSetCompletedPayload | Domain Fact
SESSION_COMPLETED | SessionEngine | RewardsService, PersistenceService, UI | SessionCompletedPayload | Domain Fact
SESSION__STRIKE_APPLIED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_PAUSED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_RESUMED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_DISTANCE_INCREASED | SessionEngine | RewardsService, PersistenceService, UI | SessionDistanceIncreasedPayload | Domain Fact
SESSION_TRAIL_COMPLETED | SessionEngine | RewardsService, PersistenceService, UI | SessionTrailCompletedPayload | Domain Fact
SESSION_BREAK_SKIPPED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
SESSION_PACE_INCREASED | SessionEngine | RewardsService, PersistenceService, UI | SessionSnapshot | Domain Fact
UI_NEW_SESSION_REQUESTED | UI | SessionEngine | SessionCfg | Request
UI_PAUSE_REQUESTED | UI | SessionEngine | null | Request
UI_RESUME_REQUESTED | UI | SessionEngine | null | Request
UI_QUIT_REQUESTED | UI | SessionEngine | null | Request
UI_BREAK_SKIP_REQUESTED | UI | SessionEngine | null | Request
PERSISTENCE_STARTED_NEW_TRAIL | PersistenceService | SessionEngine | {newTrailDistance:number} | Domain Fact
NEW_TRAIL_ASSIGNED | PersistenceService | SessionEngine | {newTrailDistance:number} | Domain Fact
