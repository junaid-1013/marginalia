"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export type TourId = "dashboard" | "workspace";

const STEPS: Record<TourId, DriveStep[]> = {
  dashboard: [
    {
      element: '[data-tour="uploader"]',
      popover: {
        title: "Start with a PDF",
        description:
          "Drop a PDF here or click to choose one. Marginalia reads it, then you can start asking questions.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="add-document"]',
      popover: {
        title: "Add more documents",
        description: "Upload another PDF whenever you need to. Each account can keep up to 10.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="documents"]',
      popover: {
        title: "Your documents",
        description:
          "Each card shows whether Marginalia has finished reading it. Open one to chat, read the summary, flip flashcards and take a quiz.",
        side: "top",
        align: "start",
      },
    },
    {
      element: '[data-tour="account"]',
      popover: {
        title: "Your account",
        description: "Switch the theme, add your AI key, take this tour again or log out from here.",
        side: "bottom",
        align: "end",
      },
    },
  ],
  workspace: [
    {
      element: '[data-tour="doc-nav"]',
      popover: {
        title: "Move between tools",
        description:
          "Switch between the document, your notes, the summary, flashcards and the quiz.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="chat"]',
      popover: {
        title: "Ask the document",
        description:
          "Answers show the pages they came from. Click a page to open it in the document.",
        side: "left",
        align: "start",
      },
    },
  ],
};

const key = (tour: TourId, userId: string) => `marginalia.tour.${tour}.${userId}`;

// storage can be blocked (private windows), then the tour simply shows again next time
const wasSeen = (tour: TourId, userId: string) => {
  try {
    return localStorage.getItem(key(tour, userId)) === "1";
  } catch {
    return false;
  }
};
const markSeen = (tour: TourId, userId: string) => {
  try {
    localStorage.setItem(key(tour, userId), "1");
  } catch {}
};

/**
 * A short spotlight tour that starts once per account and tour (the dashboard
 * tour can be replayed with ?tour=1, which the account menu links to).
 */
export const TourGuide = ({ tour, userId }: { tour: TourId; userId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const replay = tour === "dashboard" && params.get("tour") === "1";

  const instance = useRef<Driver | null>(null);
  const started = useRef(false);
  const leaving = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!replay && wasSeen(tour, userId)) return;

    // give the page a moment to settle so the spotlight lands on final positions
    const timer = setTimeout(() => {
      const steps = STEPS[tour].filter(
        (step) => typeof step.element === "string" && document.querySelector(step.element)
      );
      if (steps.length === 0) return;

      started.current = true;
      instance.current = driver({
        steps,
        showProgress: true,
        progressText: "{{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Done",
        overlayColor: "#10171E",
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 10,
        popoverClass: "marginalia-tour",
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        // closing early counts as seen: nobody wants the tour twice
        onDestroyed: () => {
          if (!leaving.current) markSeen(tour, userId);
        },
      });
      instance.current.drive();
      if (replay) router.replace(pathname);
    }, 700);

    return () => clearTimeout(timer);
  }, [tour, userId, replay, pathname, router]);

  // navigating away mid tour ends it without marking it as seen
  useEffect(
    () => () => {
      leaving.current = true;
      instance.current?.destroy();
    },
    []
  );

  return null;
};
