"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { createAccountSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/services/db/user";

type TFormDataType = z.infer<typeof createAccountSchema>;

export const signup = async (values: TFormDataType) => {
  const validateFields = createAccountSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Check the form: one of the fields is not valid." };
  }

  const { email, name, password } = validateFields.data;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await getUserByEmail(email);

  if (user) {
    return { error: "An account with this email already exists. Log in instead." };
  }

  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (e) {
    // two sign ups with the same email at the same moment
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with this email already exists. Log in instead." };
    }
    throw e;
  }

  // TODO: Send verification token email

  return { success: "User Created Successfully" };
};
