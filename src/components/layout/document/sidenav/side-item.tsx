"use client";
import { usePathname, useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface IProps {
  nav: {
    title: string;
    link: string;
    icon: React.ReactNode;
  };
}
const SideNavItem: React.FC<IProps> = ({ nav }) => {
  const params = useParams();
  const pathname = usePathname();
  return (
    <Tooltip key={nav.link} delayDuration={0}>
      <TooltipTrigger>
        <Link
          href={nav.link}
          className={cn(
            buttonVariants({
              variant: nav.link === pathname ? "default" : "ghost",
            }),
            "rounded-none h-14"
          )}
        >
          {nav.icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        <p>{nav.title}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SideNavItem;
