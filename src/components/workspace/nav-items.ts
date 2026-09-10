import {
  FileTextIcon,
  LayersIcon,
  ListChecksIcon,
  ListIcon,
  PenLineIcon,
  type LucideIcon,
} from "lucide-react";

export interface IWorkspaceTool {
  /** last segment of the route: /documents/:id/<slug> */
  slug: "view" | "note" | "summary" | "flashcards" | "quiz";
  label: string;
  short: string;
  icon: LucideIcon;
  /** press g, then this key */
  shortcut: string;
}

export const TOOLS: IWorkspaceTool[] = [
  { slug: "view", label: "Document", short: "Document", icon: FileTextIcon, shortcut: "d" },
  { slug: "note", label: "Notes", short: "Notes", icon: PenLineIcon, shortcut: "n" },
  { slug: "summary", label: "Summary", short: "Summary", icon: ListIcon, shortcut: "s" },
  { slug: "flashcards", label: "Flashcards", short: "Cards", icon: LayersIcon, shortcut: "f" },
  { slug: "quiz", label: "Quiz", short: "Quiz", icon: ListChecksIcon, shortcut: "q" },
];
