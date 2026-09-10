import { ReactNode } from "react";

/** Page frame shared by the table views. */
export function ViewShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
      {children}
    </div>
  );
}
