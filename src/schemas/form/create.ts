import { FileWithPath } from "react-dropzone";
import { z } from "zod";

export const CreateFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  // pdfFile: z.string().url({
  //   message: "Please enter a valid URL.",
  // }),
  // pdfFile not string url but react dropzone pdf file
  pdfFile: z.custom<FileWithPath[]>(),
});
