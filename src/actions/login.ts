"use server";

import * as z from "zod";

import { loginSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/services/user";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { DEFAULT_REDIRECT_URL } from "@/lib/routes";

type TFormDataType = z.infer<typeof loginSchema>;

export const login = async (values: TFormDataType) => {
  const validateFields = loginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields" };
  }
  const { email, password } = validateFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_REDIRECT_URL,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") {
        return { error: "Invalid Credentials" };
      } else {
        return { error: "An error occurred" };
      }
    }
    throw e;
  }
};
