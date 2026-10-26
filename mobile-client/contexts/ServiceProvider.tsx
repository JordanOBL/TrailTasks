import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { SessionEngine } from "../sessionEngine/sessionEngine";

import { Database } from "@nozbe/watermelondb";
import { EventBus } from "../EventBus/EventBus";
import PersistenceService from "../persistenceService/persistenceService";
import RewardService from "../services/RewardService";
import SessionEngineManager from "../sessionEngine/SessionEngineManager";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";

export interface ServiceContext {
  bus: EventBus;
  persistenceService: PersistenceService | null;
  sessionEngineMgr: SessionEngineManager | null;
  rewardService: RewardService | null;
  //WildsService?: WildService;
  //AchievementService?: AchievementService;
}

const ServiceContext = createContext<ServiceContext | undefined>(undefined);

const initialServicesState: Omit<ServiceContext, "bus"> = {
  persistenceService: null,
  sessionEngineMgr: null,
  rewardService: null,
};

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isProMember } = useAuthContext();
  const db: Database = useDatabase();
  const bus = EventBus.getInstance();

  const [servicesState, setServicesState] =
    useState<Omit<ServiceContext, "bus">>(initialServicesState);

  useEffect(() => {
    if (!user || !db) {
      setServicesState(initialServicesState);
      return;
    }
    console.log("[Services] Creating PersistenceService, SessionEngineManager, RewardService");

    const persistenceService = new PersistenceService(user, db, bus);
    const sessionEngineMgr = new SessionEngineManager(
      user,
      db,
      persistenceService,
      bus,
      isProMember,
    );

    const disposers = [persistenceService.register()];
    setServicesState(previous => ({ ...previous, persistenceService, sessionEngineMgr }));

    return () => {
      disposers.forEach(r => r());
    };
  }, [user?.id, db, isProMember]);

  // Keep native lifecycle handling account-scoped, even if the session tab is not
  // focused. Reuse the engine's pause policy: focus earns a strike, breaks do not.
  useEffect(() => {
    const manager = servicesState.sessionEngineMgr;
    if (!manager) return;
    let previousState = AppState.currentState;
    let lifecyclePausedEngine: SessionEngine | null = null;
    const subscription = AppState.addEventListener("change", nextState => {
      const wasActive = previousState === "active";
      previousState = nextState;
      const engine = manager.getCurrent();
      if (nextState === "active") {
        if (engine && engine === lifecyclePausedEngine) engine.resume();
        lifecyclePausedEngine = null;
        return;
      }
      if (!wasActive || !engine) return;
      const snapshot = engine.buildSnapshot();
      if (snapshot.isPaused || snapshot.phase === "IDLE" || snapshot.phase === "COMPLETED") return;
      lifecyclePausedEngine = engine;
      engine.pause();
    });
    return () => subscription.remove();
  }, [servicesState.sessionEngineMgr]);

  // Notification queue is account scoped, not membership scoped.
  useEffect(() => {
    if (!user || !db) return;
    const rewardService = new RewardService(bus, db, user, isProMember);
    const unregister = rewardService.register();
    setServicesState(previous => ({ ...previous, rewardService }));
    return () => unregister();
  }, [user?.id, db]);
  useEffect(() => {
    servicesState.rewardService?.setIsProMember(isProMember);
  }, [isProMember, servicesState.rewardService]);

  return (
    <ServiceContext.Provider
      value={{
        bus,
        persistenceService: servicesState.persistenceService,
        sessionEngineMgr: servicesState.sessionEngineMgr,
        rewardService: servicesState.rewardService,
      }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within <ServiceProvider>");
  return ctx;
};
