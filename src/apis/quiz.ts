import { ensureOk } from "@/apis/errors";

export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const quizAPI = async (payload: { chatId: string }) => {
  const response = await fetch("/api/quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await ensureOk(response, "Failed to start quiz");
  return response.json();
};

export const getChatQuiz = async ({ queryKey }: any): Promise<IQuizQuestion[]> => {
  const [_, id] = queryKey;
  const response = await fetch(`/api/quiz?chatId=${id}`);
  if (!response.ok) throw new Error("Failed to get quiz");
  return response.json();
};
