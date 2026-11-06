# MBTI introduction maintenance / 介绍页维护

The introduction is independent of the Next.js application. It builds with Python standard library and does not read environment files or call a model. English is at `/`; Chinese is at `/zh/`.

介绍页独立于 Next.js 应用，只使用 Python 标准库构建，不读取环境文件、不调用模型；英文默认，中文位于 `/zh/`。

- Introduction: https://songhaifan.github.io/frankie-mbti/
- Current app: https://frank-mbti.vercel.app

## Copy and real components / 文案与真实组件

`site/content.json` contains both language versions. Update corresponding fields together. The source app and collection are currently Chinese; do not imply that the online app has an English switch because this introduction is bilingual.

`site/build.py` extracts all sixteen `type`, `title`, `image`, `color` and `cognitiveFunctions` fields from `src/data/core/mbti-data.ts`. The independent preference demo uses those real records and copies original SVGs from `public/mbti_img/`. `site/demo.js` adapts the one-letter switch behavior of `src/components/type-stage.tsx`; it does not embed the full React app or store a result. If the TypeScript record format changes, update the extractor; it deliberately fails unless it finds sixteen records. Changes to the source dataset/artwork trigger Pages rebuilds.

双语文案维护在 `site/content.json`。演示由构建器提取当前十六个类型、名称、图片、颜色与功能栈，沿用应用原始 SVG。应用数据结构变化时要同步修改提取器；开关演示不保存结果，也不是完整 React 应用。

## Screens to replace / 替换哪些截图

| Asset | Capture flow | Owning UI source |
| --- | --- | --- |
| `site/assets/types-current.png` | Home, default INFP, settled character and switches | `type-stage.tsx`, `morph-figure.tsx` |
| `profile-current.png` | Toggle E/I to ENFP, open character, four-dimension section | `type-detail.tsx`, `mbti-dimensions.tsx`, `mbti-cognitive-functions.tsx` |
| `groups-current.png` | `/groups`, all four families and sixteen characters loaded | `groups-view.tsx` |
| `claims-current.png` | `/claims`, wait for actual records and source labels | `claims-view.tsx`, `services/claims-service.ts` |
| `pairing-current.png` | `/pairing`, two type reels and interpretation settled | `pairing-reels-view.tsx`, `relationOf` in core data |

Use real, settled browser captures. Wait for images and entry fades, hide credentials, and avoid private consultation history. Do not click AI Send or connection-test buttons just to make a screenshot. Update captions in both languages when the capture state changes. The first screenshot is cropped with CSS in the hero; retain the full original for the gallery. Existing approved README/social banner remains unchanged and is copied into `media/banner.png`.

截图应来自真实稳定界面，等待图片与入场动画完成，不录入凭据、不展示私人咨询记录。不要为了截图触发模型调用。截图状态变化时，同步双语说明。首页主图使用 CSS 裁剪，画廊仍保留完整原图；已确认的 banner 不随本次介绍页重绘。

If functions or pairings change, check `mbti-cognitive-functions.tsx`, core data and `pairing-reels-view.tsx`; preserve the distinction between the app's readings and measured compatibility. If the claims pipeline changes, check local fallback, filters, group inheritance and source labels. If consultation changes, inspect `agent-chat-view.tsx`, `api/mbti/agent/route.ts` and `services/mbti-agent-service.ts`; update provider, fallback and stored-key explanations without reading key values.

## Build and verify / 构建与验证

```sh
python3 site/build.py --out _site
python3 -m http.server 8080 --bind 127.0.0.1 --directory _site
node --check site/demo.js
```

Open both languages at desktop and a 390px phone viewport. Test all four switches and check code, character, title and stack change together. Check current screenshots, no horizontal overflow, keyboard focus and the `#use`/`#start` anchors. The page follows the source app's light editorial theme; it has no automatic character/scroll animation and respects reduced motion for the switch feedback.

同时检查桌面与 390px 手机布局、两种语言、四个开关的联动、图片、键盘焦点与锚点。页面遵循源应用白底墨色的编辑式视觉，不自动播放角色动画。

## Publish / 发布

Commit only reviewed `site/` and relevant Pages workflow changes, then push `main`. `.github/workflows/pages.yml` builds the independent introduction. Do not include app code changes, credentials or unrelated working files. Update `site/project.json` if deployment destinations change. The approved Frankie footer signature comes from `docs/readme/assets/frankie.svg`.
