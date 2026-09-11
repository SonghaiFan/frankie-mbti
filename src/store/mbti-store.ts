import { create } from "zustand";
import { MBTIType } from "@/types/mbti";
import { mbtiTypes } from "@/data/mbti-data";

export interface MBTIState {
  /** The code on the stage. Four switches move it; nothing else has to. */
  featured: string;
  selectedType: MBTIType | null;
  types: MBTIType[];
  dataSource: "local" | "neo4j";
  dbStats: {
    connected: boolean;
    nodes: number;
    relationships: number;
    serverAgent?: string;
  } | null;
  isLoading: boolean;
  setFeatured: (code: string) => void;
  setSelectedType: (type: MBTIType | null) => void;
  expandCard: (type: MBTIType) => void;
  collapseCard: () => void;
  fetchData: () => Promise<void>;
}

let isFetching = false;

export const useMBTIStore = create<MBTIState>((set, get) => ({
  featured: "INFP",
  selectedType: null,
  types: mbtiTypes,
  dataSource: "local",
  dbStats: null,
  isLoading: false,

  setFeatured: (code) => set({ featured: code }),
  setSelectedType: (type) => set({ selectedType: type }),
  expandCard: (type) => set({ selectedType: type }),
  collapseCard: () => set({ selectedType: null }),

  fetchData: async () => {
    if (isFetching) return;
    isFetching = true;
    set({ isLoading: true });

    try {
      const [typesRes, statusRes] = await Promise.allSettled([
        fetch("/api/mbti/types").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/mbti/status").then((r) => (r.ok ? r.json() : null)),
      ]);

      const typesData = typesRes.status === "fulfilled" ? typesRes.value : null;
      const statusData = statusRes.status === "fulfilled" ? statusRes.value : null;

      const updates: Partial<MBTIState> = { isLoading: false };

      if (statusData) {
        updates.dbStats = {
          connected: Boolean(statusData.connected),
          nodes: Number(statusData.nodes) || 0,
          relationships: Number(statusData.relationships) || 0,
          serverAgent: statusData.serverAgent,
        };
      }

      if (typesData && Array.isArray(typesData.data) && typesData.data.length > 0) {
        updates.types = typesData.data;
        updates.dataSource = typesData.source === "neo4j" ? "neo4j" : "local";

        const currentSelected = get().selectedType;
        if (currentSelected) {
          const refreshed = typesData.data.find(
            (t: MBTIType) => t.type === currentSelected.type
          );
          if (refreshed) {
            updates.selectedType = refreshed;
          }
        }
      }

      set(updates);
    } catch {
      set({ isLoading: false });
    } finally {
      isFetching = false;
    }
  },
}));
