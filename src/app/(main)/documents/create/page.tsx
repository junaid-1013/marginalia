import { auth } from "@/auth";
import CreateForm from "@/components/forms/create";
import { PageHeader } from "@/components/ui/page-header";
import { MAX_DOCUMENTS_PER_USER } from "@/constants";
import { getUserChats } from "@/services/db/chat";

export const metadata = { title: "Add a document" };

const CreateDocumentPage = async () => {
  const session = await auth();
  const count = session?.user?.id ? (await getUserChats(session.user.id))?.length ?? 0 : 0;

  return (
    <div className="container max-w-2xl space-y-8 py-8 md:py-12">
      <PageHeader
        title="Add a document"
        description={`${count} of ${MAX_DOCUMENTS_PER_USER} documents used`}
      />
      <CreateForm atLimit={count >= MAX_DOCUMENTS_PER_USER} limit={MAX_DOCUMENTS_PER_USER} />
    </div>
  );
};

export default CreateDocumentPage;
