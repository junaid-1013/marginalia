"use server";

import { loginSchema } from "@/schemas/auth";
import * as z from "zod";

type TFormDataType = z.infer<typeof loginSchema>;

export const login = async (values: TFormDataType) => {
  const validateFields = loginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields" };
  }
  return { success: "Email Send" };
};
