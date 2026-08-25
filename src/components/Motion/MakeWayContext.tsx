"use client";
import { Box } from "../../atoms/Box";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

export interface MakeWayContextType {
  isModalOpen: boolean;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
}

const MakeWayContext = createContext<MakeWayContextType | undefined>(undefined);

export function MakeWayProvider({ children }: { children: React.ReactNode }) {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const registerModal = React.useCallback((id: string) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterModal = React.useCallback((id: string) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isModalOpen = openModals.size > 0;

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open-makeway");
    } else {
      document.body.classList.remove("modal-open-makeway");
    }

    return () => {
      document.body.classList.remove("modal-open-makeway");
    };
  }, [isModalOpen]);

  const contextValue = useMemo(
    () => ({
      isModalOpen,
      registerModal,
      unregisterModal,
    }),
    [isModalOpen, registerModal, unregisterModal],
  );

  return (
    <MakeWayContext.Provider value={contextValue}>
      <Box id="app-content-wrapper" className="h-full min-h-screen w-full">
        {children}
      </Box>
    </MakeWayContext.Provider>
  );
}

export const useMakeWay = () => {
  const context = useContext(MakeWayContext);
  if (context === undefined) {
    throw new Error("useMakeWay must be used within a MakeWayProvider");
  }
  return context;
};

/**
 * MakeWay access that tolerates a missing provider. Components that can
 * function without the shift-aside behavior (e.g. standalone Modal usage in
 * tests or apps that do not use RunoxProvider) should prefer this variant.
 */
export const useMakeWayOptional = (): MakeWayContextType => ({
  isModalOpen: false,
  registerModal: () => {},
  unregisterModal: () => {},
});
