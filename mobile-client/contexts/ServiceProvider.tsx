import React, { createContext, useContext, useEffect, useState } from "react";

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
