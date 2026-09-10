"use client";

import { createContext, useContext } from "react";

interface IWorkspace {
  /** on phones the chat covers the page: leave it after opening a citation */
  closeChat: () => void;
}

const WorkspaceContext = createContext<IWorkspace>({ closeChat: () => {} });

export const WorkspaceProvider = WorkspaceContext.Provider;
export const useWorkspace = () => useContext(WorkspaceContext);
