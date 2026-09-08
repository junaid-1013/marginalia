import { Skeleton } from "@/components/ui/skeleton";

export default function CreateDocumentLoading() {
  return (
    <div className="container max-w-2xl space-y-6 py-8" aria-busy="true">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
