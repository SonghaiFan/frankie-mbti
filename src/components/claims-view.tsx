"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { mbtiTypes } from "@/data/core/mbti-data";
import vocab from "@/data/claims/vocab.json";
import type { ClaimItem, TypeClaimsResponse } from "@/services/claims-service";
import { fetchTypeClaims, useTypeClaims } from "@/hooks/use-type-claims";
import { useMBTIStore } from "@/store/mbti-store";
import { accentOf } from "@/styles/mbti-styles";
import { cn } from "@/lib/utils";
import { RuleRow } from "./section";

const PAGE = 10;
const FUNCTIONS = ["Ni", "Ne", "Si", "Se", "Ti", "Te", "Fi", "Fe"];
const easeOut = [0.16, 1, 0.3, 1] as const;

/** A count next to a label — the one place numerals appear, so they stay mono and faint. */
function Count({ n }: { n: number }) {
  return <span className="ml-1 font-mono text-[0.625rem] text-ink-faint">{n}</span>;
}

/**
 * One row of text choices, the same shape as the site nav: plain words, the
 * active one carries an accent hairline. `undefined` means "any".
 */
function Strip<T extends string>({
  label,
  items,
  active,
  accent,
  onChange,
  allLabel = "全部",
}: {
  label: string;
  items: Array<{ value: T; label: string; count?: number }>;
  active: T | undefined;
  accent: string;
  onChange: (value: T | undefined) => void;
  /** Label for the "any" choice; `null` when the strip has no such choice. */
  allLabel?: string | null;
}) {
  const choices = items.map((i) => ({ value: i.value as T | undefined, label: i.label, count: i.count }));
  const all =
    allLabel === null
      ? choices
      : [{ value: undefined as T | undefined, label: allLabel, count: undefined as number | undefined }].concat(choices);
  return (
    <div className="rule-t flex items-baseline gap-4 py-2 sm:gap-8 sm:py-3">
      <span className="eyebrow w-14 shrink-0 text-[0.625rem] sm:w-20 sm:text-[0.6875rem]">{label}</span>
      <nav className="scroll-quiet -mx-1 flex min-w-0 flex-1 gap-4 overflow-x-auto px-1 pb-1 sm:gap-6" aria-label={label}>
        {all.map((item) => {
          const isActive = item.value === active;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.value)}
              aria-pressed={isActive}
              className={cn(
                "relative shrink-0 whitespace-nowrap py-0.5 text-[0.8125rem] transition-colors duration-300 sm:text-[0.9375rem]",
                isActive ? "text-ink" : "text-ink-ghost hover:text-ink-soft"
              )}
            >
              {item.label}
              {item.count !== undefined && <Count n={item.count} />}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-1 block h-px" style={{ backgroundColor: accent }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ClaimRow({ claim, accent, typeCode }: { claim: ClaimItem; accent: string; typeCode: string }) {
  const ref = `#${String(claim.sourceIndex).padStart(3, "0")}`;
  return (
    <RuleRow className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[0.8125rem] font-medium tracking-tight sm:text-[0.875rem]" style={{ color: accent }}>
            {claim.kindName}
          </span>
          <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">
            {claim.scope === "group" && claim.via ? `作为 ${claim.via}` : typeCode}
            {claim.contexts.length > 0 && ` · ${claim.contexts.join(" · ")}`}
            {claim.functions.length > 0 && ` · ${claim.functions.map((f) => f.code).join(" ")}`}
          </span>
        </div>

        <p className="mt-1.5 max-w-[72ch] text-[0.875rem] leading-[1.75] text-ink sm:mt-2.5 sm:text-[0.9375rem] sm:leading-[1.85]">
          {claim.statement}
        </p>

        {claim.advice && (
          <p className="mt-1.5 max-w-[72ch] text-[0.8125rem] leading-[1.7] text-ink-soft sm:mt-2 sm:text-[0.875rem]">
            → {claim.advice}
          </p>
        )}

        {claim.traits.length > 0 && (
          <p className="mt-1.5 text-[0.75rem] leading-[1.6] text-ink-faint sm:mt-2 sm:text-[0.8125rem]">
            {claim.traits.join(" · ")}
          </p>
        )}
      </div>

      {/* Source footnote: number and title. */}
      <div className="shrink-0 text-[0.6875rem] leading-relaxed text-ink-faint sm:max-w-[14rem] sm:text-right">
        <span className="font-mono">{ref}</span>
        {claim.sourceTitle && <span className="ml-1.5 hidden sm:inline">{claim.sourceTitle}</span>}
      </div>
    </RuleRow>
  );
}

function totalOf(data: TypeClaimsResponse) {
  // `total` is filtered; every claim has exactly one kind, so kinds sum to the whole set.
  return data.kinds.reduce((n, k) => n + k.count, 0);
}

export function ClaimsView() {
  const featured = useMBTIStore((s) => s.featured);
  const [code, setCode] = useState(featured);
  const [context, setContext] = useState<string | undefined>();
  const [kind, setKind] = useState<string | undefined>();
  const [fn, setFn] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<ClaimItem[]>([]);
  const [more, setMore] = useState(false);

  const type = mbtiTypes.find((t) => t.type === code) ?? mbtiTypes[0];
  const accent = accentOf(type.group);
  const params = { context, kind, function: fn, q: q || undefined, limit: PAGE };
  const { data, loading } = useTypeClaims(code, params);
  // Facets come from the unfiltered set, which is the same for every query of a type.
  const { data: facets } = useTypeClaims(code, { limit: 0 });

  // Typing waits a beat before it becomes a query.
  useEffect(() => {
    const t = setTimeout(() => setQ(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  // Any change to the query invalidates the pages loaded after the first.
  useEffect(() => {
    setExtra([]);
  }, [code, context, kind, fn, q]);

  const shown = data ? [...data.claims, ...extra] : [];
  const remaining = data ? data.total - shown.length : 0;

  const loadMore = async () => {
    if (!data || more) return;
    setMore(true);
    const page = await fetchTypeClaims(code, { ...params, offset: shown.length });
    if (page) setExtra((prev) => [...prev, ...page.claims]);
    setMore(false);
  };

  const fnItems = FUNCTIONS.map((f) => ({
    value: f,
    label: f,
    count: facets?.functions.find((x) => x.code === f)?.count,
  }));

  return (
    <section className="flex flex-col lg:h-full lg:min-h-0">
      <header className="rule-b mb-3 shrink-0 pb-3 sm:mb-10 sm:pb-8 lg:mb-6 lg:pb-5">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Claims</span>
            <h2 className="display mt-2 text-ink sm:mt-4 lg:mt-3" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.75rem)" }}>
              观点
            </h2>
          </div>
          <p className="max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem] sm:leading-[1.8] lg:text-right">
            选一个类型，再按情境、观点类型、认知功能或关键词收窄。
          </p>
        </div>
      </header>

      {/* ── Query ── */}
      <div className="shrink-0">
        <Strip
          label="类型"
          items={mbtiTypes.map((t) => ({ value: t.type, label: t.type }))}
          active={code}
          accent={accent}
          onChange={(v) => setCode(v ?? featured)}
          allLabel={null}
        />
        <Strip
          label="情境"
          items={(facets?.contexts ?? vocab.contexts.map((c) => ({ name: c.name, count: undefined }))).map((c) => ({
            value: c.name,
            label: c.name,
            count: c.count,
          }))}
          active={context}
          accent={accent}
          onChange={setContext}
        />
        <Strip
          label="观点类型"
          items={(facets?.kinds ?? vocab.kinds.map((k) => ({ code: k.code, name: k.name, count: undefined }))).map((k) => ({
            value: k.code,
            label: k.name,
            count: k.count,
          }))}
          active={kind}
          accent={accent}
          onChange={setKind}
        />
        <Strip label="认知功能" items={fnItems} active={fn} accent={accent} onChange={setFn} />

        <div className="rule-t rule-b flex items-baseline gap-4 py-2 sm:gap-8 sm:py-3">
          <label htmlFor="claims-q" className="eyebrow w-14 shrink-0 text-[0.625rem] sm:w-20 sm:text-[0.6875rem]">
            关键词
          </label>
          <input
            id="claims-q"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="断崖、分手、原生家庭、小蝴蝶…"
            className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.8125rem] text-ink outline-none placeholder:text-ink-ghost sm:text-[0.9375rem]"
          />
          <span className="shrink-0 font-mono text-[0.625rem] text-ink-faint">
            {data ? `${data.total} 条` : ""}
            {facets && data && data.total !== totalOf(facets) ? ` / ${totalOf(facets)}` : ""}
          </span>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="scroll-quiet lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${code}|${context ?? ""}|${kind ?? ""}|${fn ?? ""}|${q}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {shown.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} accent={accent} typeCode={code} />
            ))}
            {loading && shown.length === 0 && (
              <p className="py-6 text-[0.8125rem] text-ink-faint">读取图谱…</p>
            )}
            {!loading && data && data.total === 0 && (
              <p className="py-6 text-[0.8125rem] text-ink-faint">没有匹配的观点。</p>
            )}
          </motion.div>
        </AnimatePresence>

        {remaining > 0 && (
          <div className="rule-t py-3 sm:py-4">
            <button
              type="button"
              onClick={loadMore}
              disabled={more}
              className="text-[0.8125rem] text-ink-soft transition-colors hover:text-ink disabled:opacity-50 sm:text-[0.875rem]"
            >
              {more ? "读取中…" : `更多 ${remaining} 条`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
