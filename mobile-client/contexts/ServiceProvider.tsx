import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { Database } from "@nozbe/watermelondb";
import { EventBus } from "../EventBus/EventBus";
import PersistenceService from "../persistenceService/persistenceService";
import RewardService from "../services/RewardService";
import SessionEngineManager from "../sessionEngine/SessionEngineManager";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";

interface ServiceContext {
  bus: EventBus;
  persistenceService: PersistenceService | null;
  sessionEngineMgr: SessionEngineManager | null;
  rewardService: RewardService | null;
  //WildsService?: WildService;
  //AchievementService?: AchievementService;
}

const ServiceContext = createContext<ServiceContext | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isProMember } = useAuthContext();
  const db: Database = useDatabase();
  const bus = EventBus.getInstance();

  const [servicesCreated, setServicesCreated] = useState<boolean>(false);

  const rewardServiceRef = useRef<RewardService | null>(null);
  const persistenceServiceRef = useRef<PersistenceService | null>(null);
  const sessionEngineMgrRef = useRef<SessionEngineManager | null>(null);
  //const wildsRef
  //const rewardsRef
  const disposersRef = useRef<Function[]>([]);

  useEffect(() => {
    if (!user || !db || servicesCreated) return;
    if (persistenceServiceRef.current) return;
    console.log("[Services] Creating PersistenceService and SessionEngineManager");

    const persistence = new PersistenceService(user, db, bus);
    const sessionEngineMgr = new SessionEngineManager(user, db, persistence, bus, isProMember);
    const rewardService = new RewardService(bus, db, user, isProMember);
    persistenceServiceRef.current = persistence;
    sessionEngineMgrRef.current = sessionEngineMgr;
    rewardServiceRef.current = rewardService;

    // Register their event listeners
    const regs: Function[] = [
      persistenceServiceRef.current.register(),
      rewardServiceRef.current.register(),
    ];

    disposersRef.current = regs;
    
    setServicesCreated(true);

    return () => {
      disposersRef.current.forEach(r => r());
      disposersRef.current = [];
      persistenceServiceRef.current = null;
      sessionEngineMgrRef.current = null;
      rewardServiceRef.current = null;
    };
  }, [user?.id, db]);

  return (
    <ServiceContext.Provider
      value={{
        bus,
        persistenceService: persistenceServiceRef.current,
        sessionEngineMgr: sessionEngineMgrRef.current,
        rewardService: rewardServiceRef.current,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within <ServiceProvider>");
  return ctx;
};
