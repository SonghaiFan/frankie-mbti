"use client";

import {
  mbtiGroupColors,
  matchingColors,
  uiColors,
} from "@/styles/mbti-styles";

export default function ColorSystemGuide() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        MBTI 颜色系统指南
      </h2>

      {/* MBTI 组别颜色 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          四大组别颜色 (紫绿蓝黄)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-lg ${mbtiGroupColors.purple.bg} ${mbtiGroupColors.purple.border} border-2`}
          >
            <div className={`font-bold ${mbtiGroupColors.purple.text}`}>
              分析师 (NT)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              紫色 - 理性思辨
            </div>
            <div className="text-xs mt-2 text-gray-500">
              INTJ, INTP, ENTJ, ENTP
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${mbtiGroupColors.green.bg} ${mbtiGroupColors.green.border} border-2`}
          >
            <div className={`font-bold ${mbtiGroupColors.green.text}`}>
              外交官 (NF)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              绿色 - 人文理想
            </div>
            <div className="text-xs mt-2 text-gray-500">
              INFJ, INFP, ENFJ, ENFP
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${mbtiGroupColors.blue.bg} ${mbtiGroupColors.blue.border} border-2`}
          >
            <div className={`font-bold ${mbtiGroupColors.blue.text}`}>
              守护者 (SJ)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              蓝色 - 稳定传统
            </div>
            <div className="text-xs mt-2 text-gray-500">
              ISTJ, ISFJ, ESTJ, ESFJ
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${mbtiGroupColors.yellow.bg} ${mbtiGroupColors.yellow.border} border-2`}
          >
            <div className={`font-bold ${mbtiGroupColors.yellow.text}`}>
              探险家 (SP)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              黄色 - 灵活适应
            </div>
            <div className="text-xs mt-2 text-gray-500">
              ISTP, ISFP, ESTP, ESFP
            </div>
          </div>
        </div>
      </section>

      {/* 配对度颜色 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          配对度颜色系统 (红色渐变)
        </h3>
        <div className="space-y-2">
          <div className={`px-4 py-2 rounded ${matchingColors.highest.bg}`}>
            <span className="font-semibold">官配类型 (100分)</span> - 最深红色
          </div>
          <div className={`px-4 py-2 rounded ${matchingColors.high.bg}`}>
            <span className="font-semibold">天作之合 (80分)</span> - 深红色
          </div>
          <div className={`px-4 py-2 rounded ${matchingColors.medium.bg}`}>
            <span className="font-semibold">有可能成 (60分)</span> - 中性灰色
          </div>
          <div className={`px-4 py-2 rounded ${matchingColors.low.bg}`}>
            <span className="font-semibold">还行吧不算完美 (40分)</span> -
            浅灰色
          </div>
          <div className={`px-4 py-2 rounded ${matchingColors.lowest.bg}`}>
            <span className="font-semibold">不合适 (20分)</span> - 最浅灰色
          </div>
        </div>
      </section>

      {/* UI 颜色系统 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          UI 颜色系统 (黑白灰色调)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg ${uiColors.neutral.bg} ${uiColors.neutral.border} border-2`}
          >
            <div className={`font-bold ${uiColors.neutral.text}`}>中性状态</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              用于默认背景、边框等
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${uiColors.selected.bg} ${uiColors.selected.border} border-2 ${uiColors.selected.ring}`}
          >
            <div className="font-bold text-white dark:text-gray-100">
              选中状态
            </div>
            <div className="text-sm text-gray-200 dark:text-gray-300 mt-1">
              用于按钮选中、活跃状态等
            </div>
          </div>
        </div>
      </section>

      {/* 颜色语义说明 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          颜色语义原则
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li>
              <strong>紫绿蓝黄</strong> - 严格保留给四大 MBTI 组别，表示类型身份
            </li>
            <li>
              <strong>红色渐变</strong> - 专门表示配对度/匹配强度，从深红到灰色
            </li>
            <li>
              <strong>黑白灰</strong> - UI
              控件、边框、按钮等界面元素，避免语义冲突
            </li>
            <li>
              <strong>一致性</strong> - 同一颜色在整个应用中始终表示相同含义
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
