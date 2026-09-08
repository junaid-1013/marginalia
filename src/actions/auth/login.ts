"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { loginSchema } from "@/schemas/auth";
import { signIn } from "@/auth";
import { DEFAULT_REDIRECT_URL } from "@/lib/routes";

type TFormDataType = z.infer<typeof loginSchema>;

export const login = async (values: TFormDataType) => {
  const validateFields = loginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }
  const { email, password } = validateFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_REDIRECT_URL,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") {
        return { error: "The email or password is incorrect." };
      } else {
        return { error: "Something went wrong. Try again in a moment." };
      }
    }
    throw e;
  }
};
