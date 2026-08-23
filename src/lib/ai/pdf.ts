import pdfParse from "pdf-parse/lib/pdf-parse.js";

export interface IPdfPage {
  page: number; // 1 based
  text: string;
}

// pdf.js text items arrive in reading order, a change of y means a new line
const renderPage = async (pageData: any): Promise<string> => {
  const content = await pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false,
  });
  let lastY: number | undefined;
  let text = "";
  for (const item of content.items) {
    const y = item.transform[5];
    text += lastY === undefined || lastY === y ? item.str : "\n" + item.str;
    lastY = y;
  }
  return text;
};

/** Text of every page of a PDF. Scanned (image only) pages come back empty. */
export const extractPdfPages = async (data: ArrayBuffer): Promise<IPdfPage[]> => {
  const pages: IPdfPage[] = [];
  await pdfParse(Buffer.from(data), {
    pagerender: async (pageData) => {
      const text = await renderPage(pageData);
      pages.push({ page: pages.length + 1, text });
      return text;
    },
  });
  return pages;
};
