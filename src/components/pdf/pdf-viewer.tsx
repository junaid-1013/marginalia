"use client";
interface IProps {
  pdfLink: string;
}
const PdfViewer = ({ pdfLink }: IProps) => {
  return <iframe src={pdfLink} width="100%" height="100%"></iframe>;
};

export default PdfViewer;
