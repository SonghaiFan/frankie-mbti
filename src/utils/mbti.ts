import { MBTIType } from "@/types/mbti";

export function getMbtiGroup(type: MBTIType): string {
  const pe = type.type[1];
  const ju = type.type[2];
  if (pe === "N" && ju === "T") return "NT";
  if (pe === "N" && ju === "F") return "NF";
  if (pe === "S" && type.type[3] === "J") return "SJ";
  if (pe === "S" && type.type[3] === "P") return "SP";
  return "";
}
