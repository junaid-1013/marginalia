import Link from "next/link";

import { Logo } from "@/components/logo";
import { MarginalRow } from "@/components/ui/margin";

/**
 * Two columns on wide screens: a brand panel showing the idea in one picture
 * (a passage, its highlight and the margin note) and the form beside it.
 */
export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <aside className="hidden flex-col justify-between border-r bg-sunken p-10 lg:flex xl:p-14">
      <Link href="/" aria-label="Marginalia home" className="w-fit">
        <Logo />
      </Link>

      <div className="max-w-md space-y-10">
        <p className="text-title text-balance">Dense texts, decoded into active recall.</p>
        <MarginalRow
          note="Recall cue: why does rereading feel productive?"
          className="md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-6"
        >
          <p className="text-reading">
            Rereading feels productive because{" "}
            <span className="mark-hl">familiar text is easy to recognise</span>. Recognition,
            however, is not recall.
          </p>
          <p className="mt-2 font-sans text-xs text-muted-foreground">p. 12</p>
        </MarginalRow>
      </div>

      <p className="text-caption">Every answer shows the page it came from.</p>
    </aside>

    <div className="flex min-h-screen flex-col">
      <div className="px-6 pt-6 lg:hidden">
        <Link href="/" aria-label="Marginalia home" className="w-fit">
          <Logo />
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  </div>
);
