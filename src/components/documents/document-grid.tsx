"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";
import type { JobStatus } from "@prisma/client";

import DeleteDocumentButton from "@/components/delete-document";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDocumentStatus } from "@/hooks/use-document-status";

export interface IDocument {
  id: string;
  name: string;
  createdAt: string;
  status: JobStatus;
  summaryStatus: JobStatus;
  flashcardsStatus: JobStatus;
  quizStatus: JobStatus;
  processingError: string | null;
}

// the search box only earns its place once the list is long enough to scan
const SEARCH_FROM = 5;

const StatusBadge = ({ doc }: { doc: IDocument }) => {
  // polls while the document is still being read, so the badge turns to Ready by itself
  const { data } = useDocumentStatus(doc.id, doc);
  const status = data?.status;
  if (status === "READY") return <Badge variant="success" dot>Ready</Badge>;
  if (status === "FAILED") return <Badge variant="destructive" dot>Failed</Badge>;
  return <Badge variant="highlight" dot>Processing</Badge>;
};

const DocumentCard = ({ doc }: { doc: IDocument }) => (
  <li className="margin-rule relative rounded-lg border bg-card transition-colors duration-150 focus-within:border-foreground hover:bg-accent/30" style={{ ["--margin-x" as string]: "1.25rem" }}>
    <div className="space-y-3 py-4 pl-9 pr-12">
      <h2 className="text-heading line-clamp-2 text-balance">
        {/* the title link covers the whole card, the delete button sits above it */}
        <Link href={`/documents/${doc.id}/view`} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">
          {doc.name}
        </Link>
      </h2>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <StatusBadge doc={doc} />
        <time dateTime={doc.createdAt} suppressHydrationWarning className="text-caption">
          Added {new Date(doc.createdAt).toLocaleDateString("en", { dateStyle: "medium" })}
        </time>
      </div>
    </div>
    <DeleteDocumentButton
      chatId={doc.id}
      name={doc.name}
      className="absolute right-2 top-2 z-10 h-8 w-8 text-muted-foreground hover:text-destructive"
    />
  </li>
);

export const DocumentGrid = ({ documents }: { documents: IDocument[] }) => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? documents.filter((d) => d.name.toLowerCase().includes(q)) : documents;

  return (
    <div className="space-y-5" data-tour="documents">
      {documents.length >= SEARCH_FROM && (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your documents"
          aria-label="Search your documents"
          suffixIcon={<SearchIcon size={16} />}
          wrapperClassName="max-w-sm"
        />
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!q && (
          <li>
            <Link
              href="/documents/create"
              className="flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card/40 p-4 text-muted-foreground transition-colors duration-150 hover:bg-accent/40 hover:text-foreground"
            >
              <PlusIcon className="h-6 w-6" />
              <span className="text-sm font-medium">Add a document</span>
            </Link>
          </li>
        )}
        {shown.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </ul>
      {q && shown.length === 0 && (
        <p className="text-sm text-muted-foreground">No document matches &ldquo;{query.trim()}&rdquo;.</p>
      )}
    </div>
  );
};
