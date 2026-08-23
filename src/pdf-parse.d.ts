declare module "pdf-parse/lib/pdf-parse.js" {
  interface IPdfParseOptions {
    // pdf.js page proxy, called for every page in order
    pagerender?: (page: any) => Promise<string>;
    max?: number;
  }
  const pdfParse: (
    data: Buffer,
    options?: IPdfParseOptions
  ) => Promise<{ numpages: number; text: string }>;
  export default pdfParse;
}
