"use client";

import { InboxIcon, SearchIcon, UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";

import { Logo, LogoMark } from "@/components/logo";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { MarginalRow, MarginNote } from "@/components/ui/margin";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const swatches: { name: string; cls: string; note: string }[] = [
  { name: "background", cls: "bg-background", note: "paper, the page" },
  { name: "card", cls: "bg-card", note: "raised sheet" },
  { name: "sunken", cls: "bg-sunken", note: "inputs, wells" },
  { name: "secondary", cls: "bg-secondary", note: "chips, quiet fills" },
  { name: "border", cls: "bg-border", note: "hairlines" },
  { name: "foreground", cls: "bg-foreground", note: "ink" },
  { name: "ink-soft", cls: "bg-ink-soft", note: "secondary text" },
  { name: "muted-foreground", cls: "bg-muted-foreground", note: "graphite, metadata" },
  { name: "highlight", cls: "bg-highlight", note: "the highlighter" },
  { name: "highlight-wash", cls: "bg-highlight-wash", note: "marker behind text" },
  { name: "highlight-ink", cls: "bg-highlight-ink", note: "highlighter as text" },
  { name: "margin", cls: "bg-margin", note: "notebook rule" },
  { name: "success", cls: "bg-success", note: "correct, ready" },
  { name: "destructive", cls: "bg-destructive", note: "wrong, failed" },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-5 border-t py-10">
    <h2 className="text-heading">{title}</h2>
    {children}
  </section>
);

const DesignShowcase = () => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-caption">Design system</span>
          <ThemeToggler />
        </div>
      </div>
    </header>

    <main className="container max-w-5xl pb-24 pt-12">
      <div className="space-y-4 pb-12">
        <LogoMark className="h-12 w-12" />
        <h1 className="text-display">Dense texts, decoded into active recall.</h1>
        <p className="text-lead max-w-2xl">
          Marginalia turns a PDF into something you can question, summarize and
          quiz yourself on, and shows the page every answer came from.
        </p>
      </div>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {swatches.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div className={`h-14 rounded-md border ${s.cls}`} />
              <p className="text-ui font-medium">{s.name}</p>
              <p className="text-caption">{s.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="space-y-6">
          <p className="text-display">Display 76</p>
          <p className="text-title">Title: a document, and what it says</p>
          <p className="text-heading">Heading: Key takeaways</p>
          <p className="text-lead max-w-2xl">
            Lead paragraph in Newsreader. Used once per page, to say what the
            page is for.
          </p>
          <p className="text-reading max-w-prose">
            Reading text is set in the serif at 17 pixels with generous leading,
            because summaries and answers are meant to be read, not scanned.
            Citations such as <span className="mark-hl">page 12</span> use the
            highlighter so the eye can find them again.
          </p>
          <p className="text-ui">UI text in Hanken Grotesk, 14 pixels, for controls and labels.</p>
          <p className="text-caption">Caption for metadata: updated 2 minutes ago, 38 pages</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Upload a PDF</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Delete document</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Search">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      <Section title="Fields">
        <div className="grid max-w-xl gap-4">
          <Input placeholder="Document title" />
          <Input placeholder="With status" status="error" defaultValue="Too short" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Search your documents" suffixIcon={<SearchIcon size={16} />} />
        </div>
      </Section>

      <Section title="Status, progress, loading">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Draft</Badge>
          <Badge variant="outline">38 pages</Badge>
          <Badge variant="highlight" dot>Processing</Badge>
          <Badge variant="success" dot>Ready</Badge>
          <Badge variant="destructive" dot>Failed</Badge>
        </div>
        <Progress value={62} aria-label="Example progress" className="max-w-md" />
        <div className="max-w-md space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Section>

      <Section title="The margin">
        <p className="text-caption max-w-prose">
          The signature. A note sits in the margin beside the text it explains,
          divided by the red rule of a ruled page.
        </p>
        <div className="space-y-6">
          <MarginalRow note="Recall cue: what does the Calvin cycle produce?">
            <p className="text-reading max-w-prose">
              The Calvin cycle uses ATP and NADPH from the light reactions to
              fix carbon dioxide into <span className="mark-hl">glucose</span>.
              It runs in the stroma and does not need light directly.
            </p>
          </MarginalRow>
          <MarginalRow note="p. 14">
            <p className="text-reading max-w-prose">
              Rubisco is the most abundant protein on Earth, yet it is slow and
              also binds oxygen, which wastes energy as photorespiration.
            </p>
          </MarginalRow>
          <MarginNote className="max-w-xs">A standalone note</MarginNote>
        </div>
      </Section>

      <Section title="Cards and tabs">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cell biology, week 4</CardTitle>
              <CardDescription>Ready, 38 pages</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Raised sheet, hairline border, no shadow.
            </CardContent>
          </Card>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="cards">Flashcards</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="pt-4 text-sm text-muted-foreground">
              The active tab is underlined with the highlighter.
            </TabsContent>
            <TabsContent value="cards" className="pt-4 text-sm text-muted-foreground">
              Flashcards content.
            </TabsContent>
            <TabsContent value="quiz" className="pt-4 text-sm text-muted-foreground">
              Quiz content.
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      <Section title="Empty, alerts, dialogs">
        <EmptyState
          icon={<InboxIcon />}
          title="No documents yet"
          description="Upload a PDF and Marginalia will read it, then you can ask questions and study from it."
          action={
            <Button>
              <UploadCloudIcon className="h-4 w-4" />
              Upload a PDF
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Alert>
            <AlertTitle>Processing your document</AlertTitle>
            <AlertDescription>Chat unlocks when it is ready.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Processing failed</AlertTitle>
            <AlertDescription>No text found. Scanned PDFs are not supported yet.</AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Delete dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the PDF, chat, summary, flashcards and quiz. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Delete document</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => toast.success("Document deleted")}>
            Toast
          </Button>
        </div>
      </Section>

      <Section title="Page header">
        <PageHeader
          title="Documents"
          description="3 of 10 documents"
          actions={<Button>Add document</Button>}
        />
      </Section>
    </main>
  </div>
);

export default DesignShowcase;
