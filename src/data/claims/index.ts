// Flat index of every claim batch, so the claim layer is bundled for the
// no-Neo4j fallback. Regenerate the import list when a batch is added.
import b001 from "./batch-001.json";
import b002 from "./batch-002.json";
import b003 from "./batch-003.json";
import b004 from "./batch-004.json";
import b005 from "./batch-005.json";
import b006 from "./batch-006.json";
import b007 from "./batch-007.json";
import b008 from "./batch-008.json";
import b009 from "./batch-009.json";
import b010 from "./batch-010.json";
import b011 from "./batch-011.json";
import b012 from "./batch-012.json";
import b013 from "./batch-013.json";
import b014 from "./batch-014.json";
import b015 from "./batch-015.json";
import b016 from "./batch-016.json";
import b017 from "./batch-017.json";
import b018 from "./batch-018.json";
import b019 from "./batch-019.json";
import b020 from "./batch-020.json";
import b021 from "./batch-021.json";
import b022 from "./batch-022.json";

export interface ClaimRecord {
  id: string;
  sourceIndex: number;
  kind: string;
  statement: string;
  subjects: Array<{ kind: "Type" | "Group"; key: string }>;
  functions?: Array<{ code: string; evidence: string }>;
  traits?: string[];
  contexts?: string[];
  example?: string;
  advice?: string;
  boundary?: string;
  aliases?: Array<{ type: string; name: string }>;
}

export const claimBatches = [
  b001,
  b002,
  b003,
  b004,
  b005,
  b006,
  b007,
  b008,
  b009,
  b010,
  b011,
  b012,
  b013,
  b014,
  b015,
  b016,
  b017,
  b018,
  b019,
  b020,
  b021,
  b022,
] as Array<{ batchId: string; claims: ClaimRecord[] }>;

export const allClaims: ClaimRecord[] = claimBatches.flatMap((b) => b.claims);
