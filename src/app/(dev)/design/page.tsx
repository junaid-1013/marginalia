import { notFound } from "next/navigation";

import DesignShowcase from "@/components/design-showcase";

export const metadata = { title: "Design system", robots: { index: false } };

// internal reference page: tokens and components in one place, never shipped
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignShowcase />;
}
