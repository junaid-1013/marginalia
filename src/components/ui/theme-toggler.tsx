"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggler() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // the label names the action, and only exists once the real theme is known
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Switch to ${next} theme` : "Switch theme"}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] scale-100 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] scale-0 dark:scale-100" />
    </Button>
  );
}
