import { cn } from "@/lib/utils";

export const mbtiColors = {
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-900 dark:text-purple-100",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900/40",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-900 dark:text-green-100",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:bg-green-100 dark:hover:bg-green-900/40",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-900 dark:text-blue-100",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/40",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-900 dark:text-yellow-100",
    border: "border-yellow-200 dark:border-yellow-800",
    hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/40",
  },
};

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

export const getMbtiColor = (group: string) => {
  switch (group) {
    case "分析师":
      return mbtiColors.purple;
    case "外交官":
      return mbtiColors.green;
    case "守护者":
      return mbtiColors.blue;
    case "探险家":
      return mbtiColors.yellow;
    default:
      return mbtiColors.purple;
  }
};

export const mbtiCard = cn(mbtiCardStyles.base, "bg-white dark:bg-gray-800");

export const mbtiCardHeader = cn(mbtiCardStyles.header);

export const mbtiCardTitle = cn(mbtiCardStyles.title);

export const mbtiCardContent = cn(mbtiCardStyles.content);

export const mbtiCardDescription = cn(mbtiCardStyles.description);
