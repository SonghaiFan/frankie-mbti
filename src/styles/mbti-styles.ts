import { cn } from "@/lib/utils";

// MBTI 四大组别颜色 - Bauhaus 风格，同时保持语义色相一致
export const mbtiGroupColors = {
  purple: {
    // 分析师 (NT) - 紫色
    bg: "bg-[#F5EEFF] border-2 md:border-4 border-[#121212]",
    bgDark: "bg-mbti-nt text-white border-2 md:border-4 border-[#121212]",
    text: "text-mbti-nt",
    border: "border-[#121212]",
    hover: "hover:bg-[#E8D5FF]",
  },
  green: {
    // 外交官 (NF) - 绿色
    bg: "bg-[#EEF7EE] border-2 md:border-4 border-[#121212]",
    bgDark: "bg-mbti-nf text-white border-2 md:border-4 border-[#121212]",
    text: "text-mbti-nf",
    border: "border-[#121212]",
    hover: "hover:bg-[#DCF2DC]",
  },
  blue: {
    // 守护者 (SJ) - 蓝色 (Bauhaus Blue)
    bg: "bg-[#EEF4FF] border-2 md:border-4 border-[#121212]",
    bgDark: "bg-mbti-sj text-white border-2 md:border-4 border-[#121212]",
    text: "text-mbti-sj",
    border: "border-[#121212]",
    hover: "hover:bg-[#D4E4FF]",
  },
  yellow: {
    // 探险家 (SP) - 黄色 (Bauhaus Yellow)
    bg: "bg-[#FFFCE8] border-2 md:border-4 border-[#121212]",
    bgDark: "bg-mbti-sp text-[#121212] border-2 md:border-4 border-[#121212]",
    text: "text-amber-600 font-bold", // 提升黄色在亮色底上的可读性
    border: "border-[#121212]",
    hover: "hover:bg-[#FFF8C4]",
  },
};

// 配对度颜色系统 - 纯色色块，符合包豪斯几何色块分割
export const matchingColors = {
  highest: {
    bg: "bg-bauhaus-red text-white border-2 border-black",
  },
  high: {
    bg: "bg-bauhaus-blue text-white border-2 border-black",
  },
  medium: {
    bg: "bg-bauhaus-yellow text-black border-2 border-black",
  },
  low: {
    bg: "bg-[#E0E0E0] text-black border-2 border-black",
  },
  lowest: {
    bg: "bg-white text-[#888888] border-2 border-black",
  },
};

// UI 通用颜色 - 黑白灰色调，不与组别颜色冲突
export const uiColors = {
  neutral: {
    bg: "bg-white border-2 md:border-4 border-[#121212]",
    bgDark: "bg-[#121212] text-white border-2 md:border-4 border-[#121212]",
    text: "text-[#121212]",
    border: "border-[#121212]",
    hover: "hover:bg-gray-100",
  },
  selected: {
    bg: "bg-[#D02020] text-white",
    border: "border-[#121212]",
    ring: "ring-2 ring-black ring-inset",
  },
};

// 向后兼容的颜色对象
export const mbtiColors = mbtiGroupColors;

export const mbtiCardStyles = {
  base: "border-2 md:border-4 border-[#121212] shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] md:shadow-[6px_6px_0px_0px_rgba(18,18,18,1)] transition-all duration-200 rounded-none overflow-hidden",
  content: "p-4 sm:p-6 space-y-4 font-sans",
  header: "p-4 sm:p-6 border-b-2 md:border-b-4 border-[#121212]",
  title: "text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900 leading-tight",
  description: "text-sm text-gray-800 font-medium",
};

export const mbtiMotionStyles = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export const getMbtiColor = (groupOrColor?: string) => {
  if (!groupOrColor) return mbtiGroupColors.blue;
  const val = groupOrColor.toLowerCase();
  
  if (val === "purple" || val === "分析师" || val === "nt") {
    return mbtiGroupColors.purple;
  }
  if (val === "green" || val === "外交官" || val === "nf") {
    return mbtiGroupColors.green;
  }
  if (val === "blue" || val === "守护者" || val === "sj") {
    return mbtiGroupColors.blue;
  }
  if (val === "yellow" || val === "探险家" || val === "sp") {
    return mbtiGroupColors.yellow;
  }
  return mbtiGroupColors.blue; // 默认返回蓝色
};

export const mbtiCard = cn(mbtiCardStyles.base, "bg-white");

export const mbtiCardHeader = cn(mbtiCardStyles.header);

export const mbtiCardTitle = cn(mbtiCardStyles.title);

export const mbtiCardContent = cn(mbtiCardStyles.content);

export const mbtiCardDescription = cn(mbtiCardStyles.description);

