import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/** What went wrong, in one line, above the form. Announced to screen readers. */
export const FormError = ({ message }: { message: string | null }) =>
  message ? (
    <Alert variant="destructive" className="py-3">
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
