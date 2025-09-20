import { create } from "zustand";
import { MBTIType } from "@/types/mbti";

export type GridViewMode =
  | "groups"
  | "dominantFunctions"
  | "matchPairs"
  | "compact";

export interface MBTIState {
  selectedType: MBTIType | null;
  viewMode: GridViewMode;
  setSelectedType: (type: MBTIType | null) => void;
  expandCard: (type: MBTIType) => void;
  collapseCard: () => void;
  setViewMode: (mode: GridViewMode) => void;
}

export const useMBTIStore = create<MBTIState>((set) => ({
  selectedType: null,
  viewMode: "groups",
  setSelectedType: (type) => set({ selectedType: type }),
  expandCard: (type) => {
    set({ selectedType: type });
    // 滚动到对应的卡片位置
    setTimeout(() => {
      const element = document.getElementById(`mbti-card-${type.type}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  },
  collapseCard: () => set({ selectedType: null }),
  setViewMode: (mode) => set({ viewMode: mode, selectedType: null }),
}));
