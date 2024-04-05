import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Button, buttonVariants } from "../../ui/button";
import { Input } from "../../ui/input";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import { UserNav } from "./user-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const Header = () => {
  return (
    <div className="bg-background/75 backdrop-blur-lg border-b border-b-muted shadow-sm sticky top-0 left-0 w-full z-50">
      <TooltipProvider>
        <header className="container flex justify-between py-4 px-8 h-20 items-center sticky top-0 z-50">
          <div className="flex">
            <Link href="/" className={cn(buttonVariants({ variant: "link" }))}>
              Home
            </Link>
            <Link
              href="/notes"
              className={cn(buttonVariants({ variant: "link" }))}
            >
              Notes
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              className="w-72"
              placeholder="Search for course, lesson, etc"
              suffixIcon={<SearchIcon size={16} />}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <ThemeToggler />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            <UserNav />
          </div>
        </header>
      </TooltipProvider>
    </div>
  );
};

export default Header;
