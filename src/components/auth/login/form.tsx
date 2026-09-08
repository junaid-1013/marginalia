"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "@/actions/auth/login";
import { FormError } from "@/components/auth/form-error";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { loginSchema } from "@/schemas/auth";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormData) {
    setError(null);
    startTransition(async () => {
      // on success the server action redirects, so only failures come back
      const response = await login(values);
      if (response?.error) setError(response.error);
    });
  }

  return (
    <Form {...form}>
      {/* method="post": if this ever submits before the page is interactive, credentials must not end up in the URL */}
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormError message={error} />
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-1 w-full" size="lg" type="submit" disabled={isPending}>
          {isPending && <Icons.spinner className="h-4 w-4 animate-spin" />}
          {isPending ? "Logging in" : "Log in"}
        </Button>
      </form>
    </Form>
  );
}
