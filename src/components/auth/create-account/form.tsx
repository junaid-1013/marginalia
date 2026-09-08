"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "@/actions/auth/login";
import { signup } from "@/actions/auth/signup";
import { FormError } from "@/components/auth/form-error";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { createAccountSchema } from "@/schemas/auth";

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export default function CreateAccountForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(values: CreateAccountFormData) {
    setError(null);
    startTransition(async () => {
      const created = await signup(values);
      if (created.error) {
        setError(created.error);
        return;
      }
      // sign the new account straight in: the server action redirects to the app
      const session = await login({ email: values.email, password: values.password });
      if (session?.error) setError(session.error);
    });
  }

  return (
    <Form {...form}>
      {/* method="post": credentials must never end up in the URL, even if this submits before hydration */}
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormError message={error} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="Your name"
                  autoComplete="name"
                  autoFocus
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>Use the eye icon to check what you typed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-1 w-full" size="lg" type="submit" disabled={isPending}>
          {isPending && <Icons.spinner className="h-4 w-4 animate-spin" />}
          {isPending ? "Creating your account" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
