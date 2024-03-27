"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createAccountSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/services/db/user";

type TFormDataType = z.infer<typeof createAccountSchema>;

export const signup = async (values: TFormDataType) => {
  const validateFields = createAccountSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields" };
  }

  const { email, name, password } = validateFields.data;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await getUserByEmail(email);

  if (user) {
    return { error: "User Already Exists" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // TODO: Send verification token email

  return { success: "User Created Successfully" };
};
