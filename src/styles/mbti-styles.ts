import { cn } from "@/lib/utils";

// MBTI 四大组别颜色 - 保持语义一致性
export const mbtiGroupColors = {
  purple: {
    // 分析师 (NT) - 紫色
    bg: "bg-purple-50 dark:bg-purple-900/20",
    bgDark: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-900 dark:text-purple-100",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900/40",
  },
  green: {
    // 外交官 (NF) - 绿色
    bg: "bg-green-50 dark:bg-green-900/20",
    bgDark: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-900 dark:text-green-100",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:bg-green-100 dark:hover:bg-green-900/40",
  },
  blue: {
    // 守护者 (SJ) - 蓝色
    bg: "bg-blue-50 dark:bg-blue-900/20",
    bgDark: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-900 dark:text-blue-100",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/40",
  },
  yellow: {
    // 探险家 (SP) - 黄色
    bg: "bg-orange-50 dark:bg-orange-900/20",
    bgDark: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-900 dark:text-orange-100",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/40",
  },
};

// 配对度颜色系统 - 红色渐变表示配对强度
export const matchingColors = {
  highest: {
    bg: "bg-red-400 text-red-900 dark:bg-red-600/50 dark:text-red-200",
  },
  high: {
    bg: "bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300",
  },
  medium: {
    bg: "bg-gray-300 text-gray-800 dark:bg-gray-500/50 dark:text-gray-300",
  },
  low: {
    bg: "bg-gray-200 text-gray-800 dark:bg-gray-600/50 dark:text-gray-300",
  },
  lowest: {
    bg: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300",
  },
};

// UI 通用颜色 - 黑白灰色调，不与组别颜色冲突
export const uiColors = {
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    bgDark: "bg-gray-100 dark:bg-gray-900/40",
    text: "text-gray-900 dark:text-gray-100",
    border: "border-gray-200 dark:border-gray-700",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
  },
  selected: {
    bg: "bg-gray-300 dark:bg-gray-600",
    border: "border-gray-900 dark:border-gray-100",
    ring: "ring-2 ring-gray-900 dark:ring-gray-100 ring-inset",
  },
};

// 向后兼容的颜色对象
export const mbtiColors = mbtiGroupColors;

export const mbtiCardStyles = {
  base: "rounded-xl shadow-lg overflow-hidden transition-colors duration-300",
  content: "p-6 space-y-4",
  header: "p-6 border-b border-gray-200 dark:border-gray-700",
  title: "text-2xl font-medium text-gray-800 dark:text-gray-200",
  description: "text-gray-600 dark:text-gray-400",
};

export const mbtiMotionStyles = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const getMbtiColor = (groupOrColor?: string) => {
  // 为向后兼容保留参数签名，但当前统一使用黑白灰中性配色
  // 触发一次读取以满足 no-unused-vars 规则
  void groupOrColor;
  return {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    bgDark: "bg-gray-100 dark:bg-gray-900/40",
    text: "text-gray-900 dark:text-gray-100",
    border: "border-gray-200 dark:border-gray-700",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
  };
};

export const mbtiCard = cn(mbtiCardStyles.base, "bg-white dark:bg-gray-800");

export const mbtiCardHeader = cn(mbtiCardStyles.header);

export const mbtiCardTitle = cn(mbtiCardStyles.title);

export const mbtiCardContent = cn(mbtiCardStyles.content);

export const mbtiCardDescription = cn(mbtiCardStyles.description);
