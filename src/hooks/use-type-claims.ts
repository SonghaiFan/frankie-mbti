"use client";

import { useEffect, useState } from "react";
import type { TypeClaimsResponse } from "@/services/claims-service";

export interface ClaimsParams {
  context?: string;
  kind?: string;
  function?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

// The stage flips types with every switch; keep responses so a revisit is free.
const cache = new Map<string, TypeClaimsResponse>();
const inflight = new Map<string, Promise<TypeClaimsResponse | null>>();

function keyOf(type: string, params: ClaimsParams) {
  const qs = new URLSearchParams({ type });
  if (params.context) qs.set("context", params.context);
  if (params.kind) qs.set("kind", params.kind);
  if (params.function) qs.set("function", params.function);
  if (params.q) qs.set("q", params.q);
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  return qs.toString();
}

export function fetchTypeClaims(type: string, params: ClaimsParams = {}) {
  const key = keyOf(type, params);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(key);
  if (!p) {
    p = fetch(`/api/mbti/claims?${key}`)
      .then((r) => (r.ok ? (r.json() as Promise<TypeClaimsResponse>) : null))
      .then((data) => {
        if (data) cache.set(key, data);
        inflight.delete(key);
        return data;
      })
      .catch(() => {
        inflight.delete(key);
        return null;
      });
    inflight.set(key, p);
  }
  return p;
}

export function useTypeClaims(type: string | undefined, params: ClaimsParams = {}) {
  const key = type ? keyOf(type, params) : "";
  const [data, setData] = useState<TypeClaimsResponse | null>(() => (key ? cache.get(key) ?? null : null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;
    const hit = cache.get(key);
    if (hit) {
      setData(hit);
      return;
    }
    let live = true;
    setLoading(true);
    fetchTypeClaims(type, params).then((res) => {
      if (!live) return;
      setData(res);
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // params is captured by `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, key]);

  return { data: data && data.type === type ? data : null, loading };
}
