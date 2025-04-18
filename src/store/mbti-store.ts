import { create } from "zustand";
import { MBTIType } from "@/types/mbti";

export interface MBTIState {
  selectedType: MBTIType | null;
  setSelectedType: (type: MBTIType | null) => void;
  expandCard: (type: MBTIType) => void;
  collapseCard: () => void;
}

export const useMBTIStore = create<MBTIState>((set) => ({
  selectedType: null,
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
}));
