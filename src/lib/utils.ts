import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CognitiveFunctionResult {
  dom: string;
  aux: string;
  third: string;
  fourth: string;
}

export function calculateCognitiveFunctions(
  mbtiType: string
): CognitiveFunctionResult {
  const pe = mbtiType.split("")[1];
  const ju = mbtiType.split("")[2];

  // Determine dominant and auxiliary functions
  let dom, aux;
  if (pe === "N" && ju === "T") {
    dom = "Ni";
    aux = "Te";
  } else if (pe === "N" && ju === "F") {
    dom = "Ni";
    aux = "Fe";
  } else if (pe === "S" && ju === "T") {
    dom = "Si";
    aux = "Te";
  } else if (pe === "S" && ju === "F") {
    dom = "Si";
    aux = "Fe";
  } else if (pe === "N" && ju === "P") {
    dom = "Ne";
    aux = "Ti";
  } else if (pe === "N" && ju === "J") {
    dom = "Ne";
    aux = "Fi";
  } else if (pe === "S" && ju === "P") {
    dom = "Se";
    aux = "Ti";
  } else {
    dom = "Se";
    aux = "Fi";
  }

  // Determine third and fourth functions
  const third = aux === "Te" ? "Fi" : "Te";
  const fourth = dom === "Ni" ? "Se" : "Ni";

  return { dom, aux, third, fourth };
}
