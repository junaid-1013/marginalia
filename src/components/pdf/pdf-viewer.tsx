"use client";
interface IProps {
  pdfLink: string | null;
}
const PdfViewer = ({ pdfLink }: IProps) => {
  if (!pdfLink) return null;
  return <iframe src={pdfLink} width="100%" height="100%"></iframe>;
};

export default PdfViewer;
