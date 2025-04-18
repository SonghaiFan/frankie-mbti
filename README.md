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

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT
