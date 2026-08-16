Event_Name | Emitter | Listener/consumer | Payload shape | Category
|--|--|--|--|--|
SESSION_STARTED | SessionEngine | UI - SessionScreen | SessionSnapshotPayload | Domain Fact
SESSION_PHASE_CHANGED | SessionEngine | Planned - UI | SessionPhaseChangedPayload | Domain Fact
SESSION_PACE_INCREASED | SessionEngine | UI - ActiveSession.tsx | SessionSnapshotPayload | Domain Fact
SESSION_PACE_DECREASED | Planned - SessionEngine | Planned - UI - ActiveSession.tsx | Planned - SessionSnapshotPayload | Domain Fact
SESSION_TICK | SessionEngine | UI - ActiveSession.tsx | SessionSnapshotPayload | Domain Fact
SESSION_SET_COMPLETED | SessionEngine | Planned - UI - ActiveSession.tsx | SessionSetCompletedPayload | Domain Fact
SESSION_COMPLETED | SessionEngine | RewardsService, UI | SessionCompletedPayload | Domain Fact
SESSION_STRIKE_APPLIED | SessionEngine | Planned - UI | Planned - SessionSnapshotPayload | Planned - Domain Fact
SESSION_PAUSED | SessionEngine | UI - ActiveSession | SessionSnapshotPayload | Domain Fact
SESSION_RESUMED | Planned - SessionEngine | Planned - UI | planned - null | Domain Fact
SESSION_DISTANCE_INCREASED | SessionEngine | PersistenceService | SessionDistanceIncreasedPayload | Domain Fact
SESSION_TRAIL_COMPLETED | SessionEngine | PersistenceService | SessionTrailCompletedPayload | Domain Fact
SESSION_BREAK_SKIPPED | SessionEngine | UI - ActiveSession.tsx | SessionSnapshotPayload | Domain Fact
UI_NEW_SESSION_REQUESTED | Planned - SessionEngine | Planned - UI | null | Request
UI_PAUSE_REQUESTED | UI | SessionEngine | null | Request
UI_RESUME_REQUESTED | UI | SessionEngine | null | Request
UI_QUIT_REQUESTED | UI | SessionEngine | null | Request
UI_BREAK_SKIP_REQUESTED | UI | SessionEngine | null | Request
PERSISTENCE_STARTED_NEW_TRAIL | Planned - PersistenceService | Planned - SessionEngine | Planned - PersistenceStartedNewTrailPayload | Domain Fact
NEW_TRAIL_ASSIGNED | PersistenceService | SessionEngine | NewTrailAssignedPayload | Domain Fact
