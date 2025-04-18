import { MBTIType, CognitiveFunction } from "@/types/mbti";

export function getMbtiGroup(type: MBTIType): string {
  const pe = type.type[1];
  const ju = type.type[2];
  if (pe === "N" && ju === "T") return "NT";
  if (pe === "N" && ju === "F") return "NF";
  if (pe === "S" && type.type[3] === "J") return "SJ";
  if (pe === "S" && type.type[3] === "P") return "SP";
  return "";
}

export function calculateCognitiveFunctions(type: MBTIType): {
  dom: CognitiveFunction;
  aux: CognitiveFunction;
  third: CognitiveFunction;
  fourth: CognitiveFunction;
} {
  const [att, pe, ju, li] = type.type.split("");
  const isI = att === "I";
  const isJext = (li === "J") === !isI;
  const domOri = isI ? "i" : "e";

  const jPair = {
    T: [
      { code: "Ti", name: "Ti", position: "主导" },
      { code: "Te", name: "Te", position: "主导" },
    ] as const,
    F: [
      { code: "Fi", name: "Fi", position: "主导" },
      { code: "Fe", name: "Fe", position: "主导" },
    ] as const,
  }[ju as "T" | "F"] as [CognitiveFunction, CognitiveFunction];

  const pPair = {
    S: [
      { code: "Si", name: "Si", position: "主导" },
      { code: "Se", name: "Se", position: "主导" },
    ] as const,
    N: [
      { code: "Ni", name: "Ni", position: "主导" },
      { code: "Ne", name: "Ne", position: "主导" },
    ] as const,
  }[pe as "S" | "N"] as [CognitiveFunction, CognitiveFunction];

  const dom = isJext
    ? jPair[domOri === "i" ? 0 : 1]
    : pPair[domOri === "i" ? 0 : 1];

  const auxOri = isI ? "e" : "i";
  const aux = isJext
    ? pPair[auxOri === "i" ? 0 : 1]
    : jPair[auxOri === "i" ? 0 : 1];

  const third =
    auxOri === "i"
      ? jPair.includes(aux)
        ? jPair[1 - jPair.indexOf(aux)]
        : pPair[1 - pPair.indexOf(aux)]
      : pPair.includes(aux)
      ? pPair[1 - pPair.indexOf(aux)]
      : jPair[1 - jPair.indexOf(aux)];

  const fourth =
    domOri === "i"
      ? jPair.includes(dom)
        ? jPair[1 - jPair.indexOf(dom)]
        : pPair[1 - pPair.indexOf(dom)]
      : pPair.includes(dom)
      ? pPair[1 - pPair.indexOf(dom)]
      : jPair[1 - jPair.indexOf(dom)];

  return { dom, aux, third, fourth };
}
