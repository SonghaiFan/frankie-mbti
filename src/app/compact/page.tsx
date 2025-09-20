import { MBTICompactTable } from "@/components/mbti-compact-table";

export const metadata = {
  title: "MBTI Compact Table",
  description: "A compact tabular view of MBTI types for quick scanning.",
};

export default function CompactPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Compact Table View
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          快速浏览所有类型、昵称、认知功能和官方最佳配对。可搜索与点击打开详情卡片。
        </p>
      </div>
      <MBTICompactTable />
    </main>
  );
}
