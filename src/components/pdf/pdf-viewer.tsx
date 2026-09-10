"use client";

interface IProps {
  chatId: string;
  /** 1 based page to open, comes from a citation */
  page?: number;
}

const PdfViewer = ({ chatId, page }: IProps) => {
  // the browser's built in viewer understands #page=N. Changing only the hash
  // would not reload the frame, so the key remounts it for every page.
  const src = `/api/documents/${chatId}/pdf${page ? `#page=${page}` : ""}`;
  return (
    <iframe
      key={`${chatId}-${page ?? 0}`}
      src={src}
      title="Document"
      className="block h-full w-full"
    />
  );
};

export default PdfViewer;
