import { create } from "zustand";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/core/mbti-data";

// Everything on the page except the claims (观点) is local data from
// src/data/core; the store never reads the graph for it. The only network call
// here is the status ping behind the header badge.
export interface MBTIState {
  /** The code on the stage. Four switches move it; nothing else has to. */
  featured: string;
  selectedType: MBTIType | null;
  types: MBTIType[];
  dbStats: {
    connected: boolean;
    nodes: number;
    relationships: number;
    serverAgent?: string;
  } | null;
  setFeatured: (code: string) => void;
  setSelectedType: (type: MBTIType | null) => void;
  expandCard: (type: MBTIType) => void;
  collapseCard: () => void;
  fetchStatus: () => Promise<void>;
}

let statusRequested = false;

export const useMBTIStore = create<MBTIState>((set) => ({
  featured: "INFP",
  selectedType: null,
  types: mbtiTypes,
  dbStats: null,

  setFeatured: (code) => set({ featured: code }),
  setSelectedType: (type) => set({ selectedType: type }),
  expandCard: (type) => set({ selectedType: type }),
  collapseCard: () => set({ selectedType: null }),

  fetchStatus: async () => {
    if (statusRequested) return;
    statusRequested = true;
    try {
      const res = await fetch("/api/mbti/status");
      if (!res.ok) return;
      const data = await res.json();
      set({
        dbStats: {
          connected: Boolean(data.connected),
          nodes: Number(data.nodes) || 0,
          relationships: Number(data.relationships) || 0,
          serverAgent: data.serverAgent,
        },
      });
    } catch {
      // The badge simply stays hidden.
    }
  },
}));
