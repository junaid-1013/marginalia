import { Skeleton } from "@/components/ui/skeleton";

// mirrors the workspace: navigation rail, content, chat
export default function WorkspaceLoading() {
  return (
    <div
      className="flex h-[calc(100vh-65px)]"
      aria-busy="true"
      aria-label="Loading the document"
    >
      <div className="flex w-16 flex-col items-center gap-4 border-r py-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-full max-h-[70vh] w-full rounded-lg" />
      </div>
      <div className="hidden w-1/3 space-y-3 border-l p-5 lg:block">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    </div>
  );
}
