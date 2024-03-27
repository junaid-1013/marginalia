"use client";

import * as z from "zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createAccountSchema } from "@/schemas/auth";
import { signup } from "@/actions/auth/signup";

type createAccountFormData = z.infer<typeof createAccountSchema>;

export default function LoginForm() {
  const [isLoading, setTransition] = useTransition();

  const form = useForm<createAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: createAccountFormData) {
    // console.log(values);
    // alert(JSON.stringify(values, null, 2));
    setTransition(async () => {
      const response = await signup(values);
      if (response.error) {
        toast.error(response.error);
        // console.log(response.error);
        form.reset();
        return;
      }
      if (response.success) {
        toast.success(response.success);
        form.reset();
        // console.log(response.success);
        return;
      }
    });
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
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
                    type="text"
                    autoCapitalize="none"
                    autoComplete="name"
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
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
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
            Create account
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
