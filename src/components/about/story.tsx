import { ArrowUpRightIcon, GithubIcon, GlobeIcon, LinkedinIcon } from "lucide-react";

import TeamAvatar from "@/components/about/team-avatar";
import { Button } from "@/components/ui/button";
import { REPO_URL } from "@/lib/site";
import { TEAM, type ITeamMember } from "@/lib/team";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const Links = ({ member }: { member: ITeamMember }) => (
  <ul className="flex flex-wrap gap-2" aria-label={`${member.name} online`}>
    {[
      { href: member.github, label: "GitHub", icon: GithubIcon },
      { href: member.linkedin, label: "LinkedIn", icon: LinkedinIcon },
      { href: member.website, label: "Website", icon: GlobeIcon },
    ].map(({ href, label, icon: Icon }) => (
      <li key={label}>
        <Button asChild variant="outline" size="sm">
          <a href={href} {...external} aria-label={`${member.name} on ${label}`}>
            <Icon className="h-4 w-4" />
            {label}
          </a>
        </Button>
      </li>
    ))}
  </ul>
);

export const AboutHero = () => (
  <section className="container max-w-6xl pb-10 pt-14 md:pb-16 md:pt-24">
    <h1 className="text-display max-w-4xl">Two classmates, one unfinished project.</h1>
    <p className="text-lead mt-6 max-w-2xl">
      Marginalia began as our academic project. It sat half finished while work took over, until
      we came back to it. This is that story, and why the code is now open for anyone to use.
    </p>
  </section>
);

/**
 * The two of us: a compact photo beside the name and links. GitHub serves
 * avatars at about 460px, so they are shown small enough to stay sharp, and
 * the second card sits a little lower so the pair reads as a spread.
 */
export const Portraits = () => (
  <section className="container max-w-6xl pb-16 md:pb-20" aria-label="The team">
    <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
      {TEAM.map((member, i) => (
        <article key={member.github} className={`flex items-start gap-5 sm:gap-6 ${i === 1 ? "md:mt-12" : ""}`}>
          <div className="group aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-xl border bg-sunken sm:w-44 lg:w-52">
            <TeamAvatar name={member.name} github={member.github} priority />
          </div>
          <div className="min-w-0 space-y-3 pt-1">
            <h2 className="text-title leading-tight">
              <span className="mark-hl">{member.name}</span>
            </h2>
            <p className="text-caption">Classmate, co-builder</p>
            <Links member={member} />
          </div>
        </article>
      ))}
    </div>
  </section>
);

interface IChapter {
  note: string;
  title: string;
  body: React.ReactNode;
}

const chapters: IChapter[] = [
  {
    note: "Same batch",
    title: "We were classmates",
    body: (
      <p>
        We studied in the same batch, sat through the same lectures and spent the same hours with
        long, dense texts: papers, lecture notes, chapters we had to understand and then actually
        remember.
      </p>
    ),
  },
  {
    note: "The idea",
    title: "What if a PDF could answer back?",
    body: (
      <p>
        For our academic project we asked a simple question. What if you could ask a document
        something, get the answer together with the page it came from, and then be quizzed on it?
        Reading is the easy part. Recall is the hard part, so we built the whole thing around
        recall.
      </p>
    ),
  },
  {
    note: "The pause",
    title: "Then work took over",
    body: (
      <p>
        Office commitments took the evenings and weekends the project needed. It worked well
        enough to demo, but it was not ready for production and parts of it were still rough. So it
        stayed in a folder, unfinished, longer than either of us wanted.
      </p>
    ),
  },
  {
    note: "Better late",
    title: "Better late than never",
    body: (
      <>
        <p>
          So we came back to it. We rebuilt the foundations: private file storage, background
          processing, search that keeps every answer inside one document, and page citations you can
          click. Then we gave it a proper face, and finished it.
        </p>
        <p className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground">
          <span className="mark-hl">Late is better than never.</span>
        </p>
      </>
    ),
  },
  {
    note: "Open to all",
    title: "Now it is yours too",
    body: (
      <p>
        Marginalia is complete enough to use, and the code is public. Use it for your own studies,
        read it to see how a document question-and-answer app is put together, fork it for your own
        ideas, or help us make it better.
      </p>
    ),
  },
];

/** The story as a document: each chapter has its label in the margin, which stays with you as you read. */
export const StoryChapters = () => (
  <section className="border-t py-16 md:py-24" aria-label="Our story">
    <div className="container max-w-6xl">
      <div className="space-y-14 md:space-y-20">
        {chapters.map((c) => (
          <div key={c.note} className="grid gap-x-10 gap-y-2 md:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="md:sticky md:top-24 md:self-start md:border-r md:border-margin/40 md:pr-6 md:text-right">
              <p className="border-l-2 border-margin/50 pl-3 font-display text-[0.9375rem] italic leading-6 text-ink-soft md:border-l-0 md:pl-0">
                {c.note}
              </p>
            </div>
            <div className="max-w-prose space-y-5">
              <h2 className="text-title">{c.title}</h2>
              <div className="text-reading space-y-5 text-ink-soft">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ways = [
  {
    name: "Read scanned PDFs",
    text: "Pages that are only images have no text to read yet. OCR support would unlock them.",
  },
  {
    name: "Move to Next.js 15",
    text: "The app is on Next.js 14, which no longer gets security fixes. The upgrade is planned and welcome.",
  },
  {
    name: "Share the rate limiter",
    text: "It lives in memory per server instance. A Redis-backed store would make it hold across instances.",
  },
  {
    name: "Report and refine",
    text: "Found a bug, a rough edge or a confusing sentence? Open an issue, or send the fix.",
  },
];

export const HelpOut = () => (
  <section className="border-t bg-card py-16 md:py-24" aria-label="How to help">
    <div className="container max-w-6xl">
      <h2 className="text-title mb-3 max-w-2xl">Where you could help</h2>
      <p className="text-reading max-w-2xl text-ink-soft">
        These are the real gaps, straight from the project&apos;s own list of known limitations.
      </p>
      <dl className="mt-10 max-w-4xl">
        {ways.map((w) => (
          <div
            key={w.name}
            className="grid gap-1 border-t py-5 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8"
          >
            <dt className="text-heading">{w.name}</dt>
            <dd className="text-reading text-ink-soft">{w.text}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <a href={REPO_URL} {...external}>
            <GithubIcon className="h-4 w-4" />
            Source on GitHub
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={`${REPO_URL}/issues`} {...external}>
            Open an issue
          </a>
        </Button>
      </div>
    </div>
  </section>
);
