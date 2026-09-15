import { AlertTriangleIcon, InboxIcon, LoaderIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyNeeded, isKeyCode } from "@/components/ai/key-needed";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface IProps {
  /** "summary", "flashcards", "quiz": used in sentences ("Generating your quiz") */
  noun: string;
  /** what the generated thing is good for, shown when there is nothing yet */
  pitch: string;
  generateLabel: string;
  loading: boolean;
  hasContent: boolean;
  documentReady: boolean;
  /** the background job is queued or running */
  running: boolean;
  /** the last job failed */
  failed: boolean;
  /** the code of that failure when it was about the AI key */
  errorCode?: string | null;
  /** the request to start a job is in flight */
  starting: boolean;
  onGenerate: () => void;
  children: React.ReactNode;
}

/**
 * The same four moments for every generated study tool: loading, waiting for
 * the document, generating, failed or empty, and finally the content itself.
 */
export const StudyGate = ({
  noun,
  pitch,
  generateLabel,
  loading,
  hasContent,
  documentReady,
  running,
  failed,
  errorCode,
  starting,
  onGenerate,
  children,
}: IProps) => {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label={`Loading the ${noun}`}>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // regenerating: keep showing the old content, say that a new one is on its way
  if (hasContent) {
    return (
      <div aria-busy={running}>
        {running && (
          <div className="mb-4" aria-live="polite">
            <Badge variant="highlight" dot>
              Generating a new {noun}
            </Badge>
          </div>
        )}
        <div className={running ? "opacity-60 transition-opacity" : "transition-opacity"}>{children}</div>
      </div>
    );
  }

  if (running) {
    return (
      <EmptyState
        icon={<LoaderIcon className="animate-spin" />}
        title={`Generating your ${noun}`}
        description="This usually takes a minute. You can leave this page, it will be here when you come back."
      />
    );
  }

  if (failed && isKeyCode(errorCode)) {
    return (
      <div className="space-y-3">
        <KeyNeeded code={errorCode} />
        <Button variant="outline" onClick={onGenerate} disabled={starting || !documentReady}>
          Try again after updating the key
        </Button>
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        icon={<AlertTriangleIcon />}
        title={`The ${noun} could not be generated`}
        description="Something went wrong while writing it. Try again."
        action={
          <Button onClick={onGenerate} disabled={starting || !documentReady}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!documentReady) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="Waiting for the document"
        description={`Marginalia is still reading this document. You can generate the ${noun} when it is ready.`}
      />
    );
  }

  return (
    <EmptyState
      icon={<SparklesIcon />}
      title={`No ${noun} yet`}
      description={pitch}
      action={
        <Button onClick={onGenerate} disabled={starting}>
          {starting && <LoaderIcon className="h-4 w-4 animate-spin" />}
          {generateLabel}
        </Button>
      }
    />
  );
};
