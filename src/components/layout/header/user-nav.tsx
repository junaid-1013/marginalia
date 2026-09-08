"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOutIcon, LibraryIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface IHeaderUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const initials = ({ name, email }: IHeaderUser) => {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
};

export function UserNav({ user }: { user: IHeaderUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-full p-0"
          aria-label={`Account menu for ${user.name || user.email || "your account"}`}
        >
          <Avatar className="h-8 w-8">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback className="bg-secondary font-sans text-xs font-semibold text-secondary-foreground">
              {initials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name || "Your account"}</p>
          {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/documents">
            <LibraryIcon className="mr-2 h-4 w-4" />
            Your documents
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => signOut({ callbackUrl: "/" })}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
