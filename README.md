![MBTI 功能推导器 — current product banner](docs/readme/banner.png)

# MBTI 功能推导器

一个基于 Next.js 和 Tailwind CSS 构建的 MBTI 类型展示和认知功能推导应用。

## Features

- 展示 16 种 MBTI 人格类型
- 按组别分类展示（分析师、外交官、守护者、探险家）
- 详细的 MBTI 类型信息展示
- 认知功能推导和解释
- 响应式设计，支持移动端和桌面端
- 四维偏好切换、配对、一览表与观点浏览
- 可选 AI 咨询与 Neo4j 观点数据接口

## Getting started

1. 克隆仓库

```bash
git clone https://github.com/SonghaiFan/frankie-mbti.git
cd frankie-mbti
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

## Project notes

### 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式、可访问的 UI 组件
- [Shadcn UI](https://ui.shadcn.com/) - 基于 Radix UI 的组件库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

### 数据与知识图谱

仓库里有两套数据，职能分开：

| 目录 | 内容 | 谁来读 |
| --- | --- | --- |
| `src/data/core/` | **非观点数据**，唯一的 ground truth：`mbti-data.ts`（16 型的昵称、口号、特征、四维、8 个认知功能与 Beebe 八层角色、4 条功能轴、32 个组别、配对读法、易错型 / 内在型） | 页面直接本地读取，**不访问数据库**；同时是图谱非观点层的种子 |
| `src/data/claims/` | **观点数据**：`batch-*.json`（1251 条原子观点 `Claim`，扁平列表，每条带 `sourceIndex`）、`sources.json`（观点出处的编号与标题，将来可以来自不同的人和渠道）、`vocab.json`（观点类型与 13 个情境） | 只有「观点」页（`/claims`）读取，来自 Neo4j；本地文件是种子，Neo4j 不可用时作回退 |

两套数据合起来就是云端 AuraDB 里的完整图谱；`core` 里的文案由观点层归纳润色而来，保持同一种口语风格（第三人称统一用 ta）。

```bash
cp .env.example .env.local   # 填入 NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD
npm run graph:check          # 只校验数据文件，不连接数据库
npm run graph:reset          # 清空数据库后完整重建（首次导入或改了 schema 时用）
npm run graph:migrate        # 幂等增量更新：MERGE 节点/关系，并清理数据文件中已删除的 Claim
npm run graph:verify         # 打印节点/关系统计与完整性检查
```

非观点层：`Letter-[:BELONGS_TO_DIMENSION]->Dimension`、`Function-[:PAIRED_AXIS]->Function`、
`Type-[:COMPOSED_OF {slot}]->Letter`、`Type-[:HAS_FUNCTION_SLOT {slot 1-8, role}]->Function`、`Type-[:HAS_TRAIT {category}]->Trait`、
`Type-[:BELONGS_TO_GROUP {category}]->Group`；类型两两之间各有一条读法（`mbtiMatches`，136 对，含名字、分数、人话解释），关系类型由两个功能栈的相对位置算出（`pairRelations` / `relationOf`，14 种：`SAME_TYPE`、`SHADOW_MIRROR`、`DUAL_COMPLEMENT`、`DOMINANT_INFERIOR`、`AUXILIARY_TERTIARY`、`SHARED_DOMINANT`、`QUASI_IDENTICAL`、`HALF_SHADOW`…），两个方向各写一条；另有 `typeLore` 里的 `MISTYPES_AS` / `HARBORS_INNER`。`Source` 节点只有编号和标题。

观点层：`Claim-[:ABOUT]->Type|Group`、`Claim-[:GROUNDED_IN {evidence}]->Function`、`Claim-[:SHOWS_TRAIT]->Trait`、
`Claim-[:IN_CONTEXT]->Context`、`Claim-[:FROM_SOURCE]->Source`、`Type-[:NICKNAMED {count}]->Nickname`。
每条 `Claim` 的字段：`statement`、`kind`、`subjects`、`functions`、`traits`、`contexts`，可选 `advice` / `boundary` / `aliases`。

脚本：
- `node --no-warnings scripts/graph/claims-next.mts --size 25` 列出 `sources.json` 里还没有观点的出处。
- `node --no-warnings scripts/graph/claims-lint.mts [--fix]` 检查 statement 里明确提到的类型码 / 认知功能是否都在 `subjects` / `functions` 里。

「观点」页的数据接口：`GET /api/mbti/claims?type=INTJ&context=分手&kind=advice&function=Ni&q=断崖&limit=10&offset=0`。

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## Development

```sh
npm run build
```

Banner sources and update instructions: [README artwork](docs/readme/README.md).

## License

MIT
