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

## 知识图谱 (Neo4j)

图谱完全由仓库内的数据文件生成，一条命令即可重建：

| 数据源 | 生成的图谱内容 |
| --- | --- |
| `src/data/mbti-data.ts` | 16 个 `Type`、`Trait`、8 个 `Function`、荣格配对规则 |
| `src/data/graph/ontology.json` | `Dimension`、`Letter`、32 个 `Group`、类型间关系（对偶/阴影/同主导/半同构/作者组合）、Beebe 八功能角色 |
| `src/data/graph/series.json` | 12 个 `Series` 专题 |
| `src/data/graph/insights.json` | 540 条精读 `Insight`（`sourceIndex` 对应 `catalogue.csv` 行号） |
| `src/data/catalogue.csv` | 540 条原始视频文稿 → `Source` 节点（溯源） |
| `src/data/graph/claims/batch-*.json` | 1251 条原子观点 `Claim`（每条视频拆成若干条可独立引用的观点）+ `Context`、`Nickname` |
| `src/data/graph/vocab.json` | 观点类型（trait/behavior/mechanism/value/relationship/mistype/advice/metaphor）与 13 个情境词表 |
| `public/mbti_pairing_labels_matrix_flat.json` | 16×16 `COMPATIBLE_WITH` 配对矩阵 |

```bash
cp .env.example .env.local   # 填入 NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD
npm run graph:check          # 只校验数据文件，不连接数据库
npm run graph:reset          # 清空数据库后完整重建（首次导入推荐）
npm run graph:migrate        # 幂等增量更新：MERGE 节点/关系，并清理数据文件中已删除的 Insight
npm run graph:verify         # 打印节点/关系统计与完整性检查
```

主要关系：`Type-[:HAS_INSIGHT {scope, weight}]->Insight`（`scope` 为 direct / group / pattern / all，
组级内容会展开到组内每个类型）、`Insight-[:BELONGS_TO_SERIES]->Series`、`Insight-[:DERIVED_FROM]->Source`、
`Type-[:HAS_FUNCTION_SLOT {slot 1-8}]->Function`、`Type-[:BELONGS_TO_GROUP]->Group`、`Type-[:COMPOSED_OF]->Letter`。

观点层：`Claim-[:ABOUT]->Type|Group`、`Claim-[:GROUNDED_IN {evidence}]->Function`、`Claim-[:SHOWS_TRAIT]->Trait`、
`Claim-[:IN_CONTEXT]->Context`、`Claim-[:FROM_SOURCE]->Source`、`Type-[:NICKNAMED {count}]->Nickname`。
`Claim` 节点保留 `statement`（三起口吻的完整观点）、`originalVoice`（原话金句）、`kind`、`advice`、`boundary` 等属性。

`src/data/mbti-data.ts` 中 16 个类型的昵称、口号、特征等文案均由观点层归纳而来，保持与视频同一种语言风格。

新增内容时只需在 `insights.json` 追加一条记录（`targets` 可以是类型码、组别码如 `NF`/`TJ`，或 `ALL`），
并在 `claims/` 下新增或追加一个批次文件（`node --no-warnings scripts/graph/claims-next.mts --size 25` 会列出尚未拆解的视频），再运行 `npm run graph:migrate`。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT
