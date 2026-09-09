import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { auth } from "@/auth";
import CreateForm from "@/components/forms/create";
import { DocumentGrid } from "@/components/documents/document-grid";
import { TourGuide } from "@/components/tour/tour-guide";
import { Button } from "@/components/ui/button";
import { MarginalRow } from "@/components/ui/margin";
import { PageHeader } from "@/components/ui/page-header";
import { MAX_DOCUMENTS_PER_USER } from "@/constants";
import { getUserChats } from "@/services/db/chat";

export const metadata = { title: "Documents" };

const ChatsPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const chats = userId ? (await getUserChats(userId)) ?? [] : [];

  // first run: the page itself is the upload, with what happens next spelled out
  if (chats.length === 0) {
    return (
      <>
        <div className="container max-w-3xl space-y-10 py-10 md:py-14">
          <div className="space-y-3">
            <h1 className="text-title">Add your first document</h1>
            <p className="text-lead max-w-xl">
              Upload a PDF and Marginalia reads it. Then you can ask it questions, read a summary,
              flip flashcards and take a quiz.
            </p>
          </div>
          <CreateForm limit={MAX_DOCUMENTS_PER_USER} />
          <div className="space-y-6 border-t pt-8">
            <h2 className="text-heading">What happens next</h2>
            <MarginalRow note="Upload">
              <p className="text-reading">Your PDF is stored privately for your account.</p>
            </MarginalRow>
            <MarginalRow note="Read">
              <p className="text-reading">
                Marginalia reads it page by page. This usually takes a minute or two, and you can
                leave while it works.
              </p>
            </MarginalRow>
            <MarginalRow note="Study">
              <p className="text-reading">
                Chat unlocks when it is ready. Every answer shows the pages it used.
              </p>
            </MarginalRow>
          </div>
        </div>
        {userId && <TourGuide tour="dashboard" userId={userId} />}
      </>
    );
  }

  return (
    <>
      <div className="container space-y-8 py-8">
        <PageHeader
          title="Documents"
          description={`${chats.length} of ${MAX_DOCUMENTS_PER_USER} documents`}
          actions={
            <Button asChild data-tour="add-document">
              <Link href="/documents/create">
                <PlusIcon className="h-4 w-4" />
                Add document
              </Link>
            </Button>
          }
        />
        <DocumentGrid
          documents={chats.map((c) => ({
            id: c.id,
            name: c.name,
            createdAt: c.createdAt.toISOString(),
            status: c.status,
            summaryStatus: c.summaryStatus,
            flashcardsStatus: c.flashcardsStatus,
            quizStatus: c.quizStatus,
            processingError: c.processingError,
          }))}
        />
      </div>
      {userId && <TourGuide tour="dashboard" userId={userId} />}
    </>
  );
};

export default ChatsPage;
