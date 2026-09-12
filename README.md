# MBTI 功能推导器 (逻辑解释版)

一个基于 Next.js 和 Tailwind CSS 构建的 MBTI 类型展示和认知功能推导应用。

## 功能特点

- 展示 16 种 MBTI 人格类型
- 按组别分类展示（分析师、外交官、守护者、探险家）
- 详细的 MBTI 类型信息展示
- 认知功能推导和解释
- 响应式设计，支持移动端和桌面端
- 优雅的动画和交互效果

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式、可访问的 UI 组件
- [Shadcn UI](https://ui.shadcn.com/) - 基于 Radix UI 的组件库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── mbti-card.tsx     # MBTI 卡片组件
│   ├── mbti-modal.tsx    # MBTI 详情模态框
│   └── ui/               # UI 组件
├── data/                  # 数据文件
│   └── mbti-data.ts      # MBTI 类型数据
├── lib/                   # 工具函数
│   └── utils.ts          # 通用工具函数
└── types/                 # TypeScript 类型定义
    └── mbti.ts           # MBTI 相关类型
```

## 开发设置

1. 克隆仓库

```bash
git clone https://github.com/yourusername/mbti.git
cd mbti
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 数据与知识图谱

仓库里有两套数据，职能分开：

| 目录 | 内容 | 谁来读 |
| --- | --- | --- |
| `src/data/core/` | **非观点数据**：`mbti-data.ts`（16 型的昵称、口号、特征、四维、认知功能、配对读法）、`ontology.json`（维度 / 字母 / 32 个组别 / 类型关系 / Beebe 角色）、`series.json`（12 个专题）、`insights.json`（540 条视频精读，`sourceIndex` 即视频编号） | 页面直接本地读取，**不访问数据库**；同时作为图谱非观点层的种子 |
| `src/data/claims/` | **观点数据**：`batch-*.json`（1251 条原子观点 `Claim`，扁平列表，每条带 `sourceIndex`）、`vocab.json`（观点类型与 13 个情境） | 只有「观点」页（`/claims`）读取，来自 Neo4j；本地文件是种子，Neo4j 不可用时作回退 |

两套数据合起来就是云端 AuraDB 里的完整图谱；`core` 里的文案均由观点层归纳润色而来，与视频保持同一种语言风格（第三人称统一用 ta）。

```bash
cp .env.example .env.local   # 填入 NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD
npm run graph:check          # 只校验数据文件，不连接数据库
npm run graph:reset          # 清空数据库后完整重建（首次导入推荐）
npm run graph:migrate        # 幂等增量更新：MERGE 节点/关系，并清理数据文件中已删除的 Insight
npm run graph:verify         # 打印节点/关系统计与完整性检查
```

非观点层关系：`Type-[:HAS_INSIGHT {scope, weight}]->Insight`（`scope` 为 direct / group / pattern / all，
组级内容会展开到组内每个类型）、`Insight-[:BELONGS_TO_SERIES]->Series`、`Insight-[:DERIVED_FROM]->Source`、
`Type-[:HAS_FUNCTION_SLOT {slot 1-8}]->Function`、`Type-[:BELONGS_TO_GROUP]->Group`、`Type-[:COMPOSED_OF]->Letter`。
`Source` 节点只保留编号、标题与标签（转录文本不入图）。

观点层关系：`Claim-[:ABOUT]->Type|Group`、`Claim-[:GROUNDED_IN {evidence}]->Function`、`Claim-[:SHOWS_TRAIT]->Trait`、
`Claim-[:IN_CONTEXT]->Context`、`Claim-[:FROM_SOURCE]->Source`、`Type-[:NICKNAMED {count}]->Nickname`。
每条 `Claim` 的字段：`statement`、`kind`、`subjects`、`functions`、`traits`、`contexts`，可选 `advice` / `boundary` / `aliases`。

脚本：
- `node --no-warnings scripts/graph/claims-next.mts --size 25` 列出尚未拆解的视频（若存在 `src/data/catalogue.csv` 会打印原始转录，否则打印精读文本）。
- `node --no-warnings scripts/graph/claims-lint.mts [--fix]` 检查 statement 里明确提到的类型码 / 认知功能是否都在 `subjects` / `functions` 里。

「观点」页的数据接口：`GET /api/mbti/claims?type=INTJ&context=分手&kind=advice&function=Ni&q=断崖&limit=10&offset=0`。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT
