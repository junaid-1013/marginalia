import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// each Inngest step is one invocation of this route, so this caps a single step
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({ client: inngest, functions });
