"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { loginSchema } from "@/schemas/auth";
import { login } from "@/actions/auth/login";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type loginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setTransition] = useTransition();

  const form = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: loginFormData) {
    setTransition(async () => {
      const response = await login(values);
      if (response?.error) {
        toast.error(response.error);
      }
      // if (response?.success) {
      //   toast.success(response.success);
      // }
    });
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="p-5"
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
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:underline hover:underline-offset-4"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="p-5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="p-5"
            type="submit"
            disabled={
              Object.keys(form.formState.errors).length > 0 || isLoading
            }
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </form>
      </Form>
      {/* seperator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      {/* buttons */}
      <div className="grid gap-2 md:grid-cols-2">
        <Button
          className="p-5"
          variant="outline"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Login with Google
        </Button>
        <Button
          className="p-5"
          variant="outline"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.apple className="mr-2 h-4 w-4" />
          )}{" "}
          Login with Apple
        </Button>
      </div>
    </div>
  );
}
