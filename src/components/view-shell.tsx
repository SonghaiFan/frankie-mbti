import { ReactNode } from "react";

/**
 * Page frame for the table views. Below lg it is an ordinary block; from lg up
 * it fills the app frame exactly so the window never scrolls.
 */
export function ViewShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col px-6 py-16 sm:px-10 sm:py-20 lg:h-full lg:min-h-0 lg:px-16 lg:py-8">
      {children}
    </div>
  );
}
