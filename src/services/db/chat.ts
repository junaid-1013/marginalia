// NOTE: no "use server" here on purpose. That directive would expose every
// export as a public server action callable by any client. These helpers are
// only meant to be called from route handlers / server components, after the
// caller has been authorised (see lib/api-guard.ts).
import { Prisma, Role } from "@prisma/client";

import { db } from "@/lib/db";
import { errorFields, logger } from "@/lib/logger";
import { IFlashcard, ISummary } from "@/types";

interface IProps {
  userId: string;
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
}

export const initializeChat = async ({
  userId,
  name,
  pdfLink,
  pdfStoragePath,
}: IProps) => {
  try {
    return await db.chat.create({
      data: {
        user: { connect: { id: userId } },
        name,
        pdfLink,
        pdfStoragePath,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("You already have a document with this name.");
    }
    throw e;
  }
};

export const getUserChats = async (userId: string) => {
  try {
    return await db.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  } catch (e) {
    logger.error("getUserChats failed", errorFields(e));
    return null;
  }
};

/** Returns the chat only when it belongs to `userId`. */
export const getUserChat = async (chatId: string, userId: string) => {
  try {
    return await db.chat.findFirst({ where: { id: chatId, userId } });
  } catch (e) {
    logger.error("getUserChat failed", errorFields(e));
    return null;
  }
};

export const saveMessage = async ({
  chatId,
  role,
  content,
  sources,
}: {
  chatId: string;
  role: Role;
  content: string;
  sources?: Prisma.InputJsonValue;
}) => {
  // id and createdAt are always generated here, never taken from the client
  return db.message.create({ data: { chatId, role, content, sources } });
};

export const getChatMessages = async (chatId: string) => {
  return db.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });
};

interface ISaveSummary {
  chatId: string;
  summary: ISummary;
}

/** Replaces any existing summary of the chat. */
export const saveSummary = async ({ chatId, summary }: ISaveSummary) => {
  await db.$transaction([
    // words are removed through the onDelete: Cascade relation
    db.summary.deleteMany({ where: { chatId } }),
    db.summary.create({
      data: {
        chatId,
        introduction: summary.introduction,
        abstract: summary.abstract,
        keyTakeaways: summary.keyTakeaways,
        tldr: summary.tldr,
        mostUsedWords: {
          createMany: {
            data: summary.mostUsedWords.map((word) => ({
              text: word.text,
              value: word.value,
            })),
          },
        },
      },
    }),
  ]);
  return chatId;
};

export const getChatSummary = async (chatId: string) => {
  return db.summary.findUnique({
    where: { chatId },
    include: { mostUsedWords: true },
  });
};

/** Replaces any existing flashcards of the chat. */
export const saveFlashcards = async ({
  chatId,
  flashcards,
}: {
  chatId: string;
  flashcards: IFlashcard[];
}) => {
  await db.$transaction([
    db.flashcard.deleteMany({ where: { chatId } }),
    db.flashcard.createMany({
      data: flashcards.map((flashcard) => ({
        chatId,
        question: flashcard.question,
        answer: flashcard.answer,
      })),
    }),
  ]);
  return chatId;
};

export const getChatFlashcards = async (chatId: string) => {
  return db.flashcard.findMany({ where: { chatId } });
};

export const saveChatNote = async ({
  chatId,
  note,
}: {
  chatId: string;
  note: string;
}) => {
  const updated = await db.chat.update({
    where: { id: chatId },
    data: { note },
  });
  return updated.note;
};

// ---- background pipeline state --------------------------------------------

export const getChatStatus = async (chatId: string) => {
  return db.chat.findUnique({
    where: { id: chatId },
    select: {
      status: true,
      summaryStatus: true,
      flashcardsStatus: true,
      quizStatus: true,
      processingError: true,
    },
  });
};

export const updateChatStatus = async (
  chatId: string,
  data: Prisma.ChatUpdateInput
) => {
  return db.chat.update({ where: { id: chatId }, data });
};

// ---- quiz ------------------------------------------------------------------

interface IQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** Replaces any existing quiz of the chat. */
export const saveQuiz = async ({
  chatId,
  questions,
}: {
  chatId: string;
  questions: IQuizQuestion[];
}) => {
  await db.$transaction([
    db.quizQuestion.deleteMany({ where: { chatId } }),
    db.quizQuestion.createMany({
      data: questions.map((q, index) => ({ ...q, chatId, index })),
    }),
  ]);
  return chatId;
};

export const getChatQuiz = async (chatId: string) => {
  return db.quizQuestion.findMany({
    where: { chatId },
    orderBy: { index: "asc" },
    select: {
      id: true,
      question: true,
      options: true,
      answerIndex: true,
      explanation: true,
    },
  });
};
