"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useAgentContext, AgentSnapshot } from "../../hooks/useAgentContext";

interface AgentContextValue {
  snapshot: AgentSnapshot;
  refresh: () => void;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

/**
 * Props for the AgentContextProvider component.
 */
export interface AgentContextProviderProps {
  children: ReactNode;
}

/**
 * Provides the current DOM snapshot of `data-rnx-*` components via React Context.
 * Also exposes the snapshot globally at `window.__rnx_agent_context__`.
 */
export function AgentContextProvider({ children }: AgentContextProviderProps) {
  const { snapshot, refresh } = useAgentContext();

  return (
    <AgentContext.Provider value={{ snapshot, refresh }}>
      {children}
    </AgentContext.Provider>
  );
}

/**
 * Consume the current agent snapshot within a React component.
 * If you only need to trigger a refresh or access it outside React, 
 * you can use the `useAgentContext` hook directly or read `window.__rnx_agent_context__`.
 */
export function useAgentSnapshot() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error(
      "useAgentSnapshot must be used within an AgentContextProvider"
    );
  }
  return context;
}
