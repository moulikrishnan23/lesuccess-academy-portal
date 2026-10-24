import { createContext, useContext } from "react";

/**
 * The shared public-data context and its hook. The provider lives in
 * AppDataContext.jsx; these are kept apart so that file exports only a
 * component, which React Fast Refresh needs to hot-reload it in place.
 */
export const AppDataContext = createContext(null);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
