// All demo content is original and scripted: the landing page never calls the API.

export const DEMO_DOC = {
  title: "The Learner's Handbook",
  chapter: "Chapter 3: Retrieval and spacing",
  pages: 38,
};

export interface IPassage {
  id: string;
  page: number;
  text: string;
}

// the two pages shown on the left. Questions cite passages by id.
export const PASSAGES: IPassage[] = [
  {
    id: "p12-a",
    page: 12,
    text: "Rereading feels productive because familiar text is easy to recognise. Recognition, however, is not recall: a student who can follow a page while it is in front of them may be unable to reproduce a single argument from it once the book is closed.",
  },
  {
    id: "p12-b",
    page: 12,
    text: "Retrieval practice reverses this. Each time a learner tries to pull an answer out of memory, the effort itself strengthens the trace. In classroom studies, students who spent half their study time answering questions outperformed students who spent all of it rereading, even on tests written in the rereaders' favour.",
  },
  {
    id: "p13-a",
    page: 13,
    text: "The effect is amplified by spacing. Memory fades along a curve that is steep at first and then flattens, so the best moment to retrieve something is just before it would have been forgotten. Reviews placed days apart, rather than minutes apart, produce slower forgetting for the same total study time.",
  },
  {
    id: "p13-b",
    page: 13,
    text: "Difficulty counts, within limits. Questions that require a learner to produce an answer, such as short responses and flashcards, tend to outperform recognition formats, because producing an answer forces a fuller search of memory. Feedback matters: an error corrected soon after is more useful than one that is never revealed.",
  },
];

export interface IQa {
  id: string;
  question: string;
  answer: string;
  /** passage ids the answer is based on, empty when the document has no answer */
  sources: string[];
}

export const QUESTIONS: IQa[] = [
  {
    id: "reread",
    question: "Why is rereading less effective than testing yourself?",
    answer:
      "Rereading makes text feel familiar, but familiarity is recognition, not recall. You can follow a page without being able to reproduce it (p. 12). Testing yourself makes you pull the answer out of memory, and that effort strengthens it. In the studies described, students who spent half their time answering questions beat students who only reread (p. 12).",
    sources: ["p12-a", "p12-b"],
  },
  {
    id: "spacing",
    question: "How should I space my reviews?",
    answer:
      "Spread them out. Forgetting is steep at first and then flattens, so the best time to review is just before you would forget. Reviews placed days apart produce slower forgetting than the same time spent in sessions minutes apart (p. 13).",
    sources: ["p13-a"],
  },
  {
    id: "format",
    question: "Which kinds of questions work best?",
    answer:
      "Questions where you have to produce the answer, like short responses and flashcards, tend to beat recognition formats. Quick feedback on your mistakes makes them more useful still (p. 13).",
    sources: ["p13-b"],
  },
  {
    id: "music",
    question: "Does the chapter say anything about studying with music?",
    answer:
      "I couldn't find that in this document. It covers rereading, retrieval practice, spacing and question formats, but not background music.",
    sources: [],
  },
];

export const SUMMARY = {
  tldr: "Test yourself instead of rereading, and space the tests out over days.",
  takeaways: [
    "Rereading builds familiarity, which feels like learning but is not recall.",
    "Answering questions from memory strengthens what you know, even when it feels harder.",
    "Review just before you would forget, with days between sessions.",
    "Prefer questions that make you produce the answer, and check your mistakes soon.",
  ],
  terms: ["retrieval practice", "spacing", "recall", "feedback", "recognition"],
};

export const FLASHCARDS = [
  {
    q: "Why does rereading feel productive?",
    a: "Familiar text is easy to recognise, and recognition feels like understanding.",
    page: 12,
  },
  {
    q: "What is retrieval practice?",
    a: "Trying to pull an answer out of memory. The effort itself strengthens the memory.",
    page: 12,
  },
  {
    q: "When is the best time to review something?",
    a: "Just before it would have been forgotten.",
    page: 13,
  },
  {
    q: "Which question formats beat recognition?",
    a: "Ones that make you produce the answer, such as short responses and flashcards.",
    page: 13,
  },
];

export const QUIZ = [
  {
    q: "A student can follow a page while reading it but cannot recall it afterwards. What does the chapter call this gap?",
    options: [
      "Recognition without recall",
      "Retrieval practice",
      "The spacing effect",
      "Productive difficulty",
    ],
    answer: 0,
    why: "Familiar text is easy to recognise, but recognition is not recall (p. 12).",
  },
  {
    q: "According to the chapter, reviews spaced days apart produce:",
    options: [
      "Faster learning but faster forgetting",
      "Slower forgetting for the same study time",
      "The same result as reviews minutes apart",
      "Better recognition but worse recall",
    ],
    answer: 1,
    why: "Spacing slows forgetting for the same total study time (p. 13).",
  },
  {
    q: "Which format tends to outperform recognition formats?",
    options: [
      "Multiple choice with hints",
      "Highlighting key sentences",
      "Short responses and flashcards",
      "Rereading the chapter twice",
    ],
    answer: 2,
    why: "Producing an answer forces a fuller search of memory (p. 13).",
  },
];
