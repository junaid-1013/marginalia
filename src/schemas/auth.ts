import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Passwords have at least 8 characters."),
});

export const createAccountSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters)."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});
