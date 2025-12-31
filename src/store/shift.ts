import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Shift } from "../lib/api"

interface ShiftState {
  currentShift: Shift | null
  setCurrentShift: (shift: Shift | null) => void
  clearCurrentShift: () => void
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      currentShift: null,
      setCurrentShift: (shift) => set({ currentShift: shift }),
      clearCurrentShift: () => set({ currentShift: null }),
    }),
    {
      name: "pos-shift-storage",
    },
  ),
)
