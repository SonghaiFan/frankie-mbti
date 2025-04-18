import { MBTIType, CognitiveFunction } from "@/types/mbti";

export function getMbtiGroup(type: MBTIType): string {
  const pe = type[1];
  const ju = type[2];
  if (pe === "N" && ju === "T") return "NT";
  if (pe === "N" && ju === "F") return "NF";
  if (pe === "S" && type[3] === "J") return "SJ";
  if (pe === "S" && type[3] === "P") return "SP";
  return "";
}

export function calculateCognitiveFunctions(type: MBTIType): {
  dom: CognitiveFunction;
  aux: CognitiveFunction;
  third: CognitiveFunction;
  fourth: CognitiveFunction;
} {
  const [att, pe, ju, li] = type.split("");
  const isI = att === "I";
  const isJext = (li === "J") === !isI;
  const domOri = isI ? "i" : "e";
  const jPair = { T: ["Ti", "Te"], F: ["Fi", "Fe"] }[ju] as [
    CognitiveFunction,
    CognitiveFunction
  ];
  const pPair = { S: ["Si", "Se"], N: ["Ni", "Ne"] }[pe] as [
    CognitiveFunction,
    CognitiveFunction
  ];

  const dom = (
    isJext ? jPair[domOri === "i" ? 0 : 1] : pPair[domOri === "i" ? 0 : 1]
  ) as CognitiveFunction;

  const auxOri = isI ? "e" : "i";
  const aux = (
    isJext ? pPair[auxOri === "i" ? 0 : 1] : jPair[auxOri === "i" ? 0 : 1]
  ) as CognitiveFunction;

  const third = (
    auxOri === "i"
      ? jPair.includes(aux)
        ? jPair[1 - jPair.indexOf(aux)]
        : pPair[1 - pPair.indexOf(aux)]
      : pPair.includes(aux)
      ? pPair[1 - pPair.indexOf(aux)]
      : jPair[1 - jPair.indexOf(aux)]
  ) as CognitiveFunction;

  const fourth = (
    domOri === "i"
      ? jPair.includes(dom)
        ? jPair[1 - jPair.indexOf(dom)]
        : pPair[1 - pPair.indexOf(dom)]
      : pPair.includes(dom)
      ? pPair[1 - pPair.indexOf(dom)]
      : jPair[1 - jPair.indexOf(dom)]
  ) as CognitiveFunction;

  return { dom, aux, third, fourth };
}
