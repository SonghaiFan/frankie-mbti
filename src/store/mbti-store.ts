import { create } from "zustand";
import { MBTIType } from "@/types/mbti";

export interface MBTIState {
  /** The code on the stage. Four switches move it; nothing else has to. */
  featured: string;
  selectedType: MBTIType | null;
  setFeatured: (code: string) => void;
  setSelectedType: (type: MBTIType | null) => void;
  expandCard: (type: MBTIType) => void;
  collapseCard: () => void;
}

export const useMBTIStore = create<MBTIState>((set) => ({
  featured: "INFP",
  selectedType: null,
  setFeatured: (code) => set({ featured: code }),
  setSelectedType: (type) => set({ selectedType: type }),
  expandCard: (type) => set({ selectedType: type }),
  collapseCard: () => set({ selectedType: null }),
}));
