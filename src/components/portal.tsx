"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Renders children at <body>, out of reach of any transformed ancestor. */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
