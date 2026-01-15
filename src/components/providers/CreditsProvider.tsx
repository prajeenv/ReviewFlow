"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CreditsContextType {
  credits: number;
  tier: string;
  setCredits: (credits: number) => void;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
  initialCredits?: number;
  initialTier?: string;
}

export function CreditsProvider({
  children,
  initialCredits = 0,
  initialTier = "FREE",
}: CreditsProviderProps) {
  const [credits, setCreditsState] = useState(initialCredits);
  const [tier, setTier] = useState(initialTier);

  const setCredits = useCallback((newCredits: number) => {
    setCreditsState(newCredits);
  }, []);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setCreditsState(data.data.credits.remaining);
        setTier(data.data.tier);
      }
    } catch (error) {
      console.error("Failed to refresh credits:", error);
    }
  }, []);

  return (
    <CreditsContext.Provider value={{ credits, tier, setCredits, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
